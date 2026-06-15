const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JSONModel {
  static collectionName = '';
  
  static getFilePath() {
    return path.join(DATA_DIR, `${this.collectionName}.json`);
  }

  static load() {
    const file = this.getFilePath();
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static save(data) {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(data, null, 2), 'utf8');
  }

  static find(query = {}) {
    const data = this.load();
    let results = data.filter(item => {
      for (let key in query) {
        const val = query[key];
        if (val && typeof val === 'object') {
          if (val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || '');
            if (!regex.test(item[key])) return false;
          }
          if (val.$exists !== undefined) {
            const exists = item[key] !== undefined;
            if (exists !== val.$exists) return false;
          }
        } else {
          if (item[key] !== val) return false;
        }
      }
      return true;
    });

    // Custom Mongoose-like chainable/sort helper
    results.sort = function(sortObj) {
      if (!sortObj) return this;
      const key = Object.keys(sortObj)[0];
      const order = sortObj[key];
      const sorted = [...this].sort((a, b) => {
        if (a[key] < b[key]) return order === 1 ? -1 : 1;
        if (a[key] > b[key]) return order === 1 ? 1 : -1;
        return 0;
      });
      // Preserve helper method on new array
      sorted.sort = results.sort;
      return sorted;
    };

    return results;
  }

  static async findOne(query = {}) {
    const list = this.find(query);
    if (list.length === 0) return null;
    return new this(list[0]);
  }

  static async findById(id) {
    const item = this.load().find((entry) => entry._id === id || entry.id === id);
    return item ? new this(item) : null;
  }

  static async create(obj) {
    if (Array.isArray(obj)) {
      const results = [];
      for (const item of obj) {
        const doc = await this.createOne(item);
        results.push(doc);
      }
      return results;
    }
    return this.createOne(obj);
  }

  static async createOne(obj) {
    const data = this.load();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...obj
    };
    data.push(newDoc);
    this.save(data);
    return new this(newDoc);
  }

  static async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      this.save([]);
    } else {
      const data = this.load();
      const filtered = data.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
      this.save(filtered);
    }
    return { deletedCount: 0 };
  }

  constructor(properties = {}) {
    Object.assign(this, properties);
  }

  async save() {
    const cls = this.constructor;
    const data = cls.load();
    
    if (!this._id) {
      this._id = Math.random().toString(36).substring(2, 9);
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
      data.push({ ...this });
    } else {
      this.updatedAt = new Date().toISOString();
      const idx = data.findIndex(item => item._id === this._id);
      if (idx !== -1) {
        data[idx] = { ...this };
      } else {
        data.push({ ...this });
      }
    }
    cls.save(data);
    return this;
  }
}

module.exports = { JSONModel };
