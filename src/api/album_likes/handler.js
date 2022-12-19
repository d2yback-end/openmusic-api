const ClientError = require('../../exceptions/ClientError');

class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._service.addAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { likesCount, isCacheAvailable = 0 } = await this._service.getAlbumLike(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: likesCount.length,
      },
    });
    response.code(200);

    if (isCacheAvailable) response.header('X-Data-Source', 'cache');

    return response;
  }
}

module.exports = AlbumLikesHandler;
