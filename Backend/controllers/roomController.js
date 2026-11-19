import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import Room from "../models/Room.js";
import { createRoomMatch } from "../services/challenge.service.js";
import RoomMember from "../models/RoomMember.js";
import Challenge from "../models/Challenge.js";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Submission from "../models/Submission.js";


// Create a temporary room
export const createTemporaryRoom = async (req, res) => {
  const session = await Room.startSession();

  try {
    const {
      roomName,
      difficulty,
      maxPlayers = 6,
      settings = {}
    } = req.body;

    if (!roomName?.trim() || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Room name and difficulty are required"
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty"
      });
    }

    if (
      !Number.isInteger(maxPlayers) ||
      maxPlayers < 2 ||
      maxPlayers > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum players must be between 2 and 100"
      });
    }

    let room;

    await session.withTransaction(async () => {
      let roomCode;
      let existingRoom;

      do {
        roomCode = randomBytes(4).toString("hex").toUpperCase();
        existingRoom = await Room.findOne({ roomCode }).session(session);
      } while (existingRoom);

      [room] = await Room.create([{
        roomCode,
        roomName: roomName.trim(),
        roomType: "temporary",
        owner: req.user.id,
        difficulty,
        maxPlayers,
        settings
      }], { session });

      await RoomMember.create([{
        room: room._id,
        user: req.user.id,
        role: "owner",
        status: "active"
      }], { session });
    });

    return res.status(201).json({
      success: true,
      message: "Temporary room created successfully",
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        roomType: room.roomType,
        difficulty: room.difficulty,
        maxPlayers: room.maxPlayers,
        matchStatus: room.matchStatus
      }
    });

  } catch (error) {
    console.error("Create temporary room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create temporary room"
    });

  } finally {
    await session.endSession();
  }
};


// Join a temporary room
export const joinTemporaryRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;

    if (!roomCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room code is required"
      });
    }

    const room = await Room.findOne({
      roomCode: roomCode.trim().toUpperCase(),
      roomType: "temporary",
      roomStatus: "active"
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Temporary room not found"
      });
    }

    if (room.matchStatus !== "waiting") {
      return res.status(409).json({
        success: false,
        message: "This room is no longer accepting players"
      });
    }

    let membership = await RoomMember.findOne({
      room: room._id,
      user: userId
    });

    if (membership?.status === "active") {
      return res.status(409).json({
        success: false,
        message: "You are already a member of this room"
      });
    }

    const activeMembers = await RoomMember.countDocuments({
      room: room._id,
      status: "active"
    });

    if (activeMembers >= room.maxPlayers) {
      return res.status(409).json({
        success: false,
        message: "Room is full"
      });
    }

    if (membership) {
      membership.status = "active";
      membership.role = "member";
      membership.joinedAt = new Date();
      await membership.save();
    } else {
      membership = await RoomMember.create({
        room: room._id,
        user: userId,
        role: "member",
        status: "active"
      });
    }

    const updatedMembers = await RoomMember.find({
      room: room._id,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = updatedMembers
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role,
        joinedAt: member.joinedAt
      }));

    const io = req.app.get("io");

    io?.to(`room:${room._id}`).emit("room:members", {
      roomId: room._id,
      members: memberList
    });

    return res.status(200).json({
      success: true,
      message: "Joined temporary room successfully",
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        role: membership.role,
        activePlayers: memberList.length,
        maxPlayers: room.maxPlayers,
        members: memberList
      }
    });

  } catch (error) {
    console.error("Join temporary room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join temporary room"
    });
  }
};


// Get temporary room details
export const getTemporaryRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      _id: roomId,
      roomType: "temporary",
      roomStatus: "active"
    })
      .populate("owner", "username")
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Temporary room not found"
      });
    }

    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      status: "active"
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room"
      });
    }

    const members = await RoomMember.find({
      room: roomId,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = members
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role,
        joinedAt: member.joinedAt
      }));

    return res.status(200).json({
      success: true,
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        owner: room.owner
          ? {
              userId: room.owner._id,
              username: room.owner.username
            }
          : null,
        difficulty: room.difficulty,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
        roomStatus: room.roomStatus,
        matchStatus: room.matchStatus,
        activePlayers: memberList.length,
        members: memberList
      }
    });

  } catch (error) {
    console.error("Get temporary room details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve temporary room details"
    });
  }
};


export const getPermanentRoomMatchDetails = async (req, res) => {
  try {
    const { roomId, matchId } = req.params;
    const userId = req.user.id;

    // 1. Verify the permanent room
    const room = await Room.findOne({
      _id: roomId,
      roomType: "permanent",
      roomStatus: "active"
    }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Permanent room not found"
      });
    }

    // 2. Verify active membership
    const membership = await RoomMember.findOne({
      room: roomId,
      user: userId,
      status: "active"
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this room"
      });
    }

    // 3. Retrieve match and challenge
    const match = await Match.findOne({
      _id: matchId,
      room: roomId
    })
      .populate(
        "challenge",
        "title description difficulty inputFormat outputFormat constraints examples starterCode points timeLimit memoryLimit"
      )
      .lean();

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    if (match.status !== "running") {
      return res.status(409).json({
        success: false,
        message: "This match is no longer running"
      });
    }

    if (!match.challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }

    // 4. Return the same response structure as temporary rooms
    return res.status(200).json({
      success: true,
      message: "Match details retrieved successfully",
      data: {
        room: {
          roomId: room._id,
          roomName: room.roomName,
          roomCode: room.roomCode,
          difficulty: room.difficulty,
          roomType: room.roomType
        },
        match: {
          matchId: match._id,
          status: match.status,
          participants: match.participants,
          startedAt: match.startedAt,
          endsAt: match.endsAt,
          duration: match.duration
        },
        challenge: match.challenge
      }
    });

  } catch (error) {
    console.error("Get permanent match details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve match details"
    });
  }
};



// Get the logged-in user's active temporary room
export const getMyTemporaryRoom = async (req, res) => {
  try {
    const memberships = await RoomMember.find({
      user: req.user.id,
      status: "active"
    })
      .sort({ joinedAt: -1 })
      .populate({
        path: "room",
        match: {
          roomType: "temporary",
          roomStatus: "active"
        }
      });
    
    const membership = memberships.find(
      (item) => item.room !== null
    );
      // .populate("user", "username");

    if (!membership || !membership.room) {
      return res.status(404).json({
        success: false,
        message: "You are not in an active temporary room"
      });
    }

    const room = membership.room;

    const members = await RoomMember.find({
      room: room._id,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = members
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role,
        joinedAt: member.joinedAt
      }));

    return res.status(200).json({
      success: true,
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        role: membership.role,
        owner: {
          userId: room.owner,
        },
        difficulty: room.difficulty,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
        matchStatus: room.matchStatus,
        activePlayers: memberList.length,
        members: memberList
      }
    });

  } catch (error) {
    console.error("Get my temporary room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your temporary room"
    });
  }
};


export const createRoom = async (req, res) => {
  const session = await Room.startSession();

  try {
    const {
      roomName,
      password,
      difficulty,
      maxPlayers = 6,
      settings = {}
    } = req.body;

    // Validate required fields
    if (!roomName?.trim() || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Room name and difficulty are required"
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Room password must be at least 6 characters and no more than 72 bytes"
      });
    }

    if (
      !Number.isInteger(maxPlayers) ||
      maxPlayers < 2 ||
      maxPlayers > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum players must be between 2 and 100"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let room;

    await session.withTransaction(async () => {
      // Generate a unique room code
      let roomCode;
      let existingRoom;

      do {
        roomCode = randomBytes(3).toString("hex").toUpperCase();
        existingRoom = await Room.findOne({ roomCode }).session(session);
      } while (existingRoom);

      // Create permanent room
      [room] = await Room.create([{
        roomCode,
        roomName: roomName.trim(),
        passwordHash,
        roomType: "permanent",
        owner: req.user.id,
        difficulty,
        maxPlayers,
        settings
      }], { session });

      // Automatically register creator as owner
      await RoomMember.create([{
        room: room._id,
        user: req.user.id,
        role: "owner",
        status: "active"
      }], { session });
    });

    return res.status(201).json({
      success: true,
      message: "Permanent room created successfully",
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        roomType: room.roomType,
        owner: room.owner,
        difficulty: room.difficulty,
        maxPlayers: room.maxPlayers,
        matchStatus: room.matchStatus
      }
    });

  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create room"
    });

  } finally {
    await session.endSession();
  }
};


export const joinRoom = async (req, res) => {
  try {
    const { roomCode, password } = req.body;
    const userId = req.user.id;

    if (!roomCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room code is required"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid room password is required"
      });
    }

    // Find room using room code
    const room = await Room.findOne({
      roomCode: roomCode.trim().toUpperCase()
    }).select("+passwordHash");

    if (!room || room.roomStatus !== "active") {
      return res.status(404).json({
        success: false,
        message: "Room not found or unavailable"
      });
    }

    if (!room.passwordHash) {
      return res.status(403).json({
        success: false,
        message: "This room does not have a configured password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      room.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect room password"
      });
    }

    // Only allow joining before match starts
    if (room.matchStatus !== "waiting") {
      return res.status(409).json({
        success: false,
        message: "This room is not accepting new members"
      });
    }

    // Check existing membership
    let membership = await RoomMember.findOne({
      room: room._id,
      user: userId
    });

    if (membership?.status === "active") {
      return res.status(409).json({
        success: false,
        message: "You are already a member of this room"
      });
    }

    // Count current active members (including owner)
    const activeMembers = await RoomMember.countDocuments({
      room: room._id,
      status: "active"
    });

    if (activeMembers >= room.maxPlayers) {
      return res.status(409).json({
        success: false,
        message: "Room is full"
      });
    }

    // Reactivate previous membership or create a new one
    if (membership) {
      membership.status = "active";
      membership.role = "member";
      membership.joinedAt = new Date();
      await membership.save();
    } else {
      membership = await RoomMember.create({
        room: room._id,
        user: userId,
        role: "member",
        status: "active"
      });
    }

        // Get updated active member list
    const updatedMembers = await RoomMember.find({
      room: room._id,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = updatedMembers
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role
      }));

    // Notify players already connected to this room
    const io = req.app.get("io");

    io.to(`room:${room._id}`).emit("room:members", {
      roomId: room._id,
      members: memberList
    });

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
          data: {
          roomId: room._id,
          roomCode: room.roomCode,
          roomName: room.roomName,
          role: membership.role,
          activePlayers: memberList.length,
          maxPlayers: room.maxPlayers,
          members: memberList
      }
    });

  } catch (error) {
    console.error("Join room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join room"
    });
  }
};


export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);

    if (!room || room.roomStatus !== "active") {
      return res.status(404).json({
        success: false,
        message: "Room not found or unavailable"
      });
    }

    // Owner cannot leave their own room
    if (room.owner.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "Room owner cannot leave their own room"
      });
    }

    // Find active membership
    const membership = await RoomMember.findOne({
      room: roomId,
      user: userId,
      status: "active"
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "You are not an active member of this room"
      });
    }

    // Do not allow leaving during an active match
    if (room.matchStatus === "active") {
      return res.status(409).json({
        success: false,
        message: "You cannot leave while a match is running"
      });
    }

    // Update membership
    membership.status = "left";
    await membership.save();

    const socketRoom = `room:${roomId}`;
    const io = req.app.get("io");

    // Remove this user's connected sockets from the room channel
    const sockets = await io.in(socketRoom).fetchSockets();

    for (const connectedSocket of sockets) {
      if (connectedSocket.user?.id === userId) {
        await connectedSocket.leave(socketRoom);
      }
    }

    // Get remaining active members
    const updatedMembers = await RoomMember.find({
      room: roomId,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = updatedMembers
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role
      }));

    // Notify remaining players
    io.to(socketRoom).emit("room:members", {
      roomId,
      members: memberList
    });

    return res.status(200).json({
      success: true,
      message: "You left the room successfully",
      data: {
        roomId,
        activePlayers: memberList.length,
        members: memberList
      }
    });

  } catch (error) {
    console.error("Leave room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to leave room"
    });
  }
};


export const leaveTemporaryRoom = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    let roomClosed = false;
    let updatedMembers = [];

    await session.withTransaction(async () => {
      const room = await Room.findOne({
        _id: roomId,
        roomType: "temporary",
        roomStatus: "active"
      }).session(session);

      if (!room) {
        throw new Error("Temporary room not found");
      }

      if (room.matchStatus === "active") {
        throw new Error("You cannot leave while a match is running");
      }

      const membership = await RoomMember.findOne({
        room: roomId,
        user: userId,
        status: "active"
      }).session(session);

      if (!membership) {
        throw new Error("You are not an active member of this room");
      }

      // If the owner leaves, close and delete the temporary room.
      if (membership.role === "owner") {
        const matches = await Match.find({
          room: roomId
        }).select("_id").session(session);

        const matchIds = matches.map(match => match._id);

        if (matchIds.length > 0) {
          await Submission.deleteMany(
            { match: { $in: matchIds } },
            { session }
          );

          await Match.deleteMany(
            { room: roomId },
            { session }
          );
        }

        await RoomMember.deleteMany(
          { room: roomId },
          { session }
        );

        await Room.deleteOne(
          { _id: roomId, roomType: "temporary" },
          { session }
        );

        roomClosed = true;
        return;
      }

      // Regular member leaves.
      membership.status = "left";
      await membership.save({ session });

      const members = await RoomMember.find({
        room: roomId,
        status: "active"
      })
        .populate("user", "username")
        .session(session)
        .lean();

      updatedMembers = members
        .filter(member => member.user)
        .map(member => ({
          userId: member.user._id,
          username: member.user.username,
          role: member.role,
          joinedAt: member.joinedAt
        }));
    });

    const io = req.app.get("io");
    const socketRoom = `room:${roomId}`;

    if (roomClosed) {
      // Notify everyone before removing their sockets.
      io?.to(socketRoom).emit("room:closed", {
        roomId,
        message: "The room owner has closed this temporary room."
      });

      // Remove all connected sockets from the deleted room.
      if (io) {
        const sockets = await io.in(socketRoom).fetchSockets();

        for (const connectedSocket of sockets) {
          await connectedSocket.leave(socketRoom);
        }
      }
    } else {
      // Remove the leaving user's sockets from the room.
      if (io) {
        const sockets = await io.in(socketRoom).fetchSockets();

        for (const connectedSocket of sockets) {
          if (connectedSocket.user?.id === userId) {
            await connectedSocket.leave(socketRoom);
          }
        }

        io.to(socketRoom).emit("room:members", {
          roomId,
          members: updatedMembers
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: roomClosed
        ? "Temporary room closed successfully"
        : "You left the temporary room successfully",
      data: {
        roomId,
        roomClosed,
        members: updatedMembers
      }
    });

  } catch (error) {
    console.error("Leave temporary room error:", error);

    const statusCode =
      error.message === "Temporary room not found" ? 404 :
      error.message === "You are not an active member of this room" ? 403 :
      error.message === "You cannot leave while a match is running" ? 409 :
      500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Unable to leave temporary room"
    });

  } finally {
    await session.endSession();
  }
};


// Start a room match
export const startRoomMatch = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify room exists
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Only room owner can start the match
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the room owner can start the match"
      });
    }

    // Create match and assign random challenge
    const match = await createRoomMatch(roomId);

    // Notify all connected room members that the match has started
    const io = req.app.get("io");

    io.to(`room:${roomId}`).emit("room:matchStarted", {
      roomId: room._id,
      matchId: match._id,
      challengeId: match.challenge,
      status: match.status,
      participants: match.participants,
      startedAt: match.startedAt,
      endsAt: match.endsAt
    });

    return res.status(200).json({
      success: true,
      message: "Match started successfully",
      data: {
        matchId: match._id,
        roomId: match.room,
        challengeId: match.challenge,
        status: match.status,
        participants: match.participants,
        startedAt: match.startedAt,
        endsAt: match.endsAt
      }
    });

  } catch (error) {
    console.error("Start match error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const startTemporaryRoomMatch = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify that this is an active temporary room
    const room = await Room.findOne({
      _id: roomId,
      roomType: "temporary",
      roomStatus: "active"
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Temporary room not found"
      });
    }

    // Only the room owner can start the match
    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the room owner can start the match"
      });
    }

    // Reuse the existing match creation service
    const match = await createRoomMatch(roomId);

    const io = req.app.get("io");

    // Notify connected room members
    io?.to(`room:${roomId}`).emit("room:matchStarted", {
      roomId: room._id,
      matchId: match._id,
      challengeId: match.challenge,
      status: match.status,
      participants: match.participants,
      startedAt: match.startedAt,
      endsAt: match.endsAt
    });

    return res.status(200).json({
      success: true,
      message: "Temporary room match started successfully",
      data: {
        roomId: match.room,
        matchId: match._id,
        challengeId: match.challenge,
        status: match.status,
        participants: match.participants,
        startedAt: match.startedAt,
        endsAt: match.endsAt
      }
    });

  } catch (error) {
    console.error("Start temporary match error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to start temporary match"
    });
  }
};


export const getRoomChallenge = async (req, res) => {
  try {
    const { roomId } = req.params;

    // 1. Verify room exists
    const room = await Room.findById(roomId);

    if (!room || room.roomStatus !== "active") {
      return res.status(404).json({
        success: false,
        message: "Room not found or unavailable"
      });
    }

    // 2. Verify active room membership
    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      status: "active"
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this room"
      });
    }

    // 3. Check match status
    if (room.matchStatus !== "active" || !room.challenge) {
      return res.status(409).json({
        success: false,
        message: "The match has not started yet"
      });
    }

    // 4. Retrieve only public challenge fields
    const challenge = await Challenge.findById(room.challenge)
      .select(
        "title description difficulty inputFormat outputFormat constraints examples starterCode points timeLimit memoryLimit"
      )
      .lean();

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Assigned challenge not found"
      });
    }

    // 5. Return safe challenge data
    return res.status(200).json({
      success: true,
      message: "Challenge retrieved successfully",
      data: challenge
    });

  } catch (error) {
    console.error("Get room challenge error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve challenge"
    });
  }
};


export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      _id: roomId,
      roomType: "permanent",
      roomStatus: "active"
    })
      .populate("owner", "username")
      .lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Permanent room not found"
      });
    }

    // Verify active membership
    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      status: "active"
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room"
      });
    }

    // Retrieve active members
    const members = await RoomMember.find({
      room: roomId,
      status: "active"
    })
      .populate("user", "username")
      .lean();

    const memberList = members
      .filter(member => member.user)
      .map(member => ({
        userId: member.user._id,
        username: member.user.username,
        role: member.role,
        joinedAt: member.joinedAt
      }));

    return res.status(200).json({
      success: true,
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        owner: {
          userId: room.owner._id,
          username: room.owner.username
        },
        difficulty: room.difficulty,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
        roomStatus: room.roomStatus,
        matchStatus: room.matchStatus,
        totalMatches: room.totalMatches,
        activePlayers: memberList.length,
        members: memberList
      }
    });

  } catch (error) {
    console.error("Get room details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve room details"
    });
  }
};


export const getTemporaryRoomMatchDetails = async (req, res) => {
  try {
    const { roomId, matchId } = req.params;
    const userId = req.user.id;

    // 1. Verify the temporary room
    const room = await Room.findOne({
      _id: roomId,
      roomType: "temporary",
      roomStatus: "active"
    }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Temporary room not found"
      });
    }

    // 2. Verify active membership
    const membership = await RoomMember.findOne({
      room: roomId,
      user: userId,
      status: "active"
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this room"
      });
    }

    // 3. Retrieve the match and challenge
    const match = await Match.findOne({
      _id: matchId,
      room: roomId
    })
      .populate(
        "challenge",
        "title description difficulty inputFormat outputFormat constraints examples starterCode points timeLimit memoryLimit"
      )
      .lean();

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }

    if (match.status !== "running") {
      return res.status(409).json({
        success: false,
        message: "This match is no longer running"
      });
    }

    if (!match.challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }

    // 4. Return match, room and challenge information
    return res.status(200).json({
      success: true,
      message: "Match details retrieved successfully",
      data: {
        room: {
          roomId: room._id,
          roomName: room.roomName,
          roomCode: room.roomCode,
          difficulty: room.difficulty,
          roomType: room.roomType
        },
        match: {
          matchId: match._id,
          status: match.status,
          participants: match.participants,
          startedAt: match.startedAt,
          endsAt: match.endsAt,
          duration: match.duration
        },
        challenge: match.challenge
      }
    });

  } catch (error) {
    console.error("Get temporary match details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve match details"
    });
  }
};


// Get all rooms associated with the logged-in user
export const getMyRooms = async (req, res) => {
  try {
    const memberships = await RoomMember.find({
      user: req.user.id
    })
      .populate({
        path: "room",
        select: "roomCode roomName roomType owner maxPlayers roomStatus matchStatus difficulty totalMatches createdAt"
      })
      .sort({ joinedAt: -1 })
      .lean();

    const rooms = memberships
      .filter((membership) => membership.room)
      .map((membership) => ({
        membershipId: membership._id,
        role: membership.role,
        membershipStatus: membership.status,
        joinedAt: membership.joinedAt,
        room: membership.room
      }));

    const permanentRooms = rooms.filter(
      (item) => item.room.roomType === "permanent"
    );

    const temporaryRooms = rooms.filter(
      (item) => item.room.roomType === "temporary"
    );

    return res.status(200).json({
      success: true,
      data: {
        permanentRooms,
        temporaryRooms,
        summary: {
          totalRooms: rooms.length,
          permanentRooms: permanentRooms.length,
          temporaryRooms: temporaryRooms.length,
          activeMemberships: rooms.filter(
            (item) => item.membershipStatus === "active"
          ).length,
          leftMemberships: rooms.filter(
            (item) => item.membershipStatus === "left"
          ).length
        }
      }
    });

  } catch (error) {
    console.error("Get my rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your rooms"
    });
  }
};
