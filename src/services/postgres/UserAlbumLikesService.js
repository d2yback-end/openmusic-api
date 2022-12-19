const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this.likeAlbum(userId, albumId);
    } else {
      await this.unlikeAlbum(userId, albumId);
    }
    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async likeAlbum(userId, albumId) {
    const id = `album_likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like gagal ditambahkan');
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like gagal dihapus');
    }
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return { likesCount: JSON.parse(result), isCacheAvailable: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT user_id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`album_likes:${albumId}`, JSON.stringify(result.rows));

      return { likesCount: result.rows };
    }
  }
}

module.exports = UserAlbumLikesService;
