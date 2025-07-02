const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../database.json');
    this.uploadsPath = path.join(__dirname, '../uploads');
    this.ensureUploadsDirectory();
  }

  async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsPath);
    } catch {
      await fs.mkdir(this.uploadsPath, { recursive: true });
    }
  }

  async readDatabase() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return default structure
      return {
        users: [],
        files: [],
        curriculum: [],
        reports: [],
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        }
      };
    }
  }

  async writeDatabase(data) {
    data.metadata.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  // User operations
  async findUser(query) {
    const db = await this.readDatabase();
    return db.users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  }

  async findUserById(id) {
    const db = await this.readDatabase();
    return db.users.find(user => user._id === id);
  }

  async createUser(userData) {
    const db = await this.readDatabase();
    const newUser = {
      _id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    db.users.push(newUser);
    await this.writeDatabase(db);
    return newUser;
  }

  async updateUser(id, updateData) {
    const db = await this.readDatabase();
    const userIndex = db.users.findIndex(user => user._id === id);
    if (userIndex === -1) return null;
    
    db.users[userIndex] = { ...db.users[userIndex], ...updateData };
    await this.writeDatabase(db);
    return db.users[userIndex];
  }

  async deleteUser(id) {
    const db = await this.readDatabase();
    const userIndex = db.users.findIndex(user => user._id === id);
    if (userIndex === -1) return false;
    
    db.users.splice(userIndex, 1);
    await this.writeDatabase(db);
    return true;
  }

  // File operations
  async saveFile(fileData) {
    const db = await this.readDatabase();
    const newFile = {
      _id: crypto.randomUUID(),
      ...fileData,
      uploadedAt: new Date().toISOString(),
      filePath: path.join(this.uploadsPath, fileData.filename)
    };
    db.files.push(newFile);
    await this.writeDatabase(db);
    return newFile;
  }

  async findFile(query) {
    const db = await this.readDatabase();
    return db.files.find(file => {
      return Object.keys(query).every(key => file[key] === query[key]);
    });
  }

  async findFileById(id) {
    const db = await this.readDatabase();
    return db.files.find(file => file._id === id);
  }

  async updateFile(id, updateData) {
    const db = await this.readDatabase();
    const fileIndex = db.files.findIndex(file => file._id === id);
    if (fileIndex === -1) return null;
    
    db.files[fileIndex] = { ...db.files[fileIndex], ...updateData };
    await this.writeDatabase(db);
    return db.files[fileIndex];
  }

  async deleteFile(id) {
    const db = await this.readDatabase();
    const fileIndex = db.files.findIndex(file => file._id === id);
    if (fileIndex === -1) return false;
    
    const file = db.files[fileIndex];
    // Delete physical file
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.log('File not found for deletion:', file.filePath);
    }
    
    db.files.splice(fileIndex, 1);
    await this.writeDatabase(db);
    return true;
  }

  // Curriculum operations
  async saveCurriculum(curriculumData) {
    const db = await this.readDatabase();
    const newCurriculum = {
      _id: crypto.randomUUID(),
      ...curriculumData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.curriculum.push(newCurriculum);
    await this.writeDatabase(db);
    return newCurriculum;
  }

  async findCurriculum(query = {}) {
    const db = await this.readDatabase();
    if (Object.keys(query).length === 0) {
      return db.curriculum;
    }
    return db.curriculum.filter(curriculum => {
      return Object.keys(query).every(key => curriculum[key] === query[key]);
    });
  }

  async findCurriculumById(id) {
    const db = await this.readDatabase();
    return db.curriculum.find(curriculum => curriculum._id === id);
  }

  async updateCurriculum(id, updateData) {
    const db = await this.readDatabase();
    const curriculumIndex = db.curriculum.findIndex(curriculum => curriculum._id === id);
    if (curriculumIndex === -1) return null;
    
    db.curriculum[curriculumIndex] = { 
      ...db.curriculum[curriculumIndex], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.writeDatabase(db);
    return db.curriculum[curriculumIndex];
  }

  async deleteCurriculum(id) {
    const db = await this.readDatabase();
    const curriculumIndex = db.curriculum.findIndex(curriculum => curriculum._id === id);
    if (curriculumIndex === -1) return false;
    
    db.curriculum.splice(curriculumIndex, 1);
    await this.writeDatabase(db);
    return true;
  }

  // Report operations
  async saveReport(reportData) {
    const db = await this.readDatabase();
    const newReport = {
      _id: crypto.randomUUID(),
      ...reportData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.reports.push(newReport);
    await this.writeDatabase(db);
    return newReport;
  }

  async findReports(query = {}) {
    const db = await this.readDatabase();
    if (Object.keys(query).length === 0) {
      return db.reports;
    }
    return db.reports.filter(report => {
      return Object.keys(query).every(key => report[key] === query[key]);
    });
  }

  async findReportById(id) {
    const db = await this.readDatabase();
    return db.reports.find(report => report._id === id);
  }

  async updateReport(id, updateData) {
    const db = await this.readDatabase();
    const reportIndex = db.reports.findIndex(report => report._id === id);
    if (reportIndex === -1) return null;
    
    db.reports[reportIndex] = { 
      ...db.reports[reportIndex], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.writeDatabase(db);
    return db.reports[reportIndex];
  }

  async deleteReport(id) {
    const db = await this.readDatabase();
    const reportIndex = db.reports.findIndex(report => report._id === id);
    if (reportIndex === -1) return false;
    
    db.reports.splice(reportIndex, 1);
    await this.writeDatabase(db);
    return true;
  }

  // Utility methods
  async getStats() {
    const db = await this.readDatabase();
    return {
      totalUsers: db.users.length,
      totalFiles: db.files.length,
      totalCurriculum: db.curriculum.length,
      totalReports: db.reports.length,
      lastUpdated: db.metadata.lastUpdated
    };
  }

  async backup() {
    const db = await this.readDatabase();
    const backupPath = path.join(__dirname, `../backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, JSON.stringify(db, null, 2));
    return backupPath;
  }
}

module.exports = new Database(); 