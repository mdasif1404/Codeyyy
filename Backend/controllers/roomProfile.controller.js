
import RoomMember from "../models/RoomMember.js";

export const getMyRooms = async (req, res) => {
  try {
    const memberships = await RoomMember.find({
      user: req.user.id
    })
      .populate({
        path: "room",
        select:
          "roomCode roomName roomType owner maxPlayers roomStatus matchStatus totalMatches difficulty createdAt"
      })
      .sort({ joinedAt: -1 });

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
      rooms: {
        permanent: permanentRooms,
        temporary: temporaryRooms
      },
      summary: {
        total: rooms.length,
        active: rooms.filter(
          (item) => item.membershipStatus === "active"
        ).length
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
