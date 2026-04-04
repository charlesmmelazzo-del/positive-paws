require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('./index');

const migrate = async () => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar_url TEXT,
        bio TEXT,
        total_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Dogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dogs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        breed VARCHAR(100),
        age_years DECIMAL(4,1),
        weight_lbs DECIMAL(6,1),
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
        photo_url TEXT,
        bio TEXT,
        created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        training_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // User-Dog relationships (many-to-many)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_dogs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
        relationship VARCHAR(50) DEFAULT 'owner',
        is_primary BOOLEAN DEFAULT false,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, dog_id)
      );
    `);

    // Courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        book_source VARCHAR(200),
        author VARCHAR(100),
        difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        thumbnail_emoji VARCHAR(10),
        color VARCHAR(20),
        order_index INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Lessons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        key_takeaway TEXT,
        order_index INTEGER DEFAULT 0,
        reading_time_minutes INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Quizzes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title VARCHAR(200),
        passing_score INTEGER DEFAULT 70,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Quiz questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL,
        explanation TEXT,
        order_index INTEGER DEFAULT 0
      );
    `);

    // User lesson progress
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );
    `);

    // User quiz attempts
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        answers JSONB,
        points_earned INTEGER DEFAULT 0,
        attempted_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Scenarios table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        color VARCHAR(20),
        category VARCHAR(50),
        order_index INTEGER DEFAULT 0
      );
    `);

    // Add guide column to scenarios if it doesn't exist
    await client.query(`
      ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS guide TEXT;
    `);

    // Scenario tips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scenario_tips (
        id SERIAL PRIMARY KEY,
        scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
        tip_title VARCHAR(200),
        tip_text TEXT NOT NULL,
        tip_type VARCHAR(30) DEFAULT 'do' CHECK (tip_type IN ('do', 'dont', 'why', 'reward')),
        order_index INTEGER DEFAULT 0
      );
    `);

    // Dog scenario training logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS dog_training_logs (
        id SERIAL PRIMARY KEY,
        dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        scenario_id INTEGER REFERENCES scenarios(id) ON DELETE SET NULL,
        success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
        notes TEXT,
        behavior_tags JSONB DEFAULT '[]',
        logged_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Dog behavior milestones
    await client.query(`
      CREATE TABLE IF NOT EXISTS dog_milestones (
        id SERIAL PRIMARY KEY,
        dog_id INTEGER REFERENCES dogs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        milestone_name VARCHAR(200) NOT NULL,
        milestone_type VARCHAR(50),
        achieved BOOLEAN DEFAULT false,
        achieved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
