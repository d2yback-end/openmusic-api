const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongs({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, genre, performer, duration, "albumId" FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        updatedAt,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal diperbaharui, Id Song tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus, Id Song tidak ditemukan');
    }
  }
}

module.exports = SongsService;
