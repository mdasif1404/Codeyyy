// Handlers are plain functions of (req, res) so they can be tested without a running server.
function createHandlers(service) {
  return {
    list: async (req, res) => res.json(await service.list(req.query)),
    stats: async (req, res) => res.json(await service.stats()),
    random: async (req, res) => res.json(await service.random(req.query)),
    get: async (req, res) => {
      if (String(req.query.format).toLowerCase() === 'markdown') {
        return res.type('text/markdown').send(await service.markdown(req.params.id));
      }
      return res.json(await service.get(req.params.id));
    },
    markdown: async (req, res) => res.type('text/markdown').send(await service.markdown(req.params.id)),
  };
}

function createRouter(service) {
  const { Router } = require('express');
  const h = createHandlers(service);
  const wrap = (fn) => (req, res, next) => fn(req, res).catch(next); // Express 4 needs this for async handlers
  const router = Router();
  // Fixed paths must be registered before "/:id".
  router.get('/', wrap(h.list));
  router.get('/stats', wrap(h.stats));
  router.get('/random', wrap(h.random));
  router.get('/:id', wrap(h.get));
  router.get('/:id/markdown', wrap(h.markdown));
  return router;
}

module.exports = { createHandlers, createRouter };
