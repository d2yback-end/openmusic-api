class PlaylistSongsHanlder {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifiyPlaylistOwner(id, credentialId);
    await this._playlistSongsService.verifySong(songId);
    await this._playlistSongsService.addPlaylistSong(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan pada Playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifiyPlaylistOwner(id, credentialId);

    const playlist = await this._playlistsService.getPlaylistById(id);
    const songs = await this._playlistSongsService.getPlaylistSong(id);

    const playlistSong = { ...playlist, songs };

    return {
      status: 'success',
      data: {
        playlist: playlistSong,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifiyPlaylistOwner(id, credentialId);
    await this._playlistSongsService.verifySong(songId);
    await this._playlistSongsService.deletePlaylistSong(id, songId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari Playlist',
    };
  }
}

module.exports = PlaylistSongsHanlder;
