const PlaylistSongsHanlder = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist_songs',
  version: '1.0.0',
  register: async (server, { playlistSongsService, playlistsService, validator }) => {
    const playlistSongsHanlder = new PlaylistSongsHanlder(
      playlistSongsService,
      playlistsService,
      validator,
    );
    server.route(routes(playlistSongsHanlder));
  },
};
