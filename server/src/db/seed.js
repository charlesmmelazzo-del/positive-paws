require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('./index');

const seed = async () => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // ─── Admin User ───────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('PositivePaws2024!', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, bio)
      VALUES ('Mike', 'mikemelazzo@me.com', $1, 'admin', 'Positive Paws founder and head trainer.')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
    `, [passwordHash]);
    console.log('✅ Admin user seeded');

    // ─── Courses ──────────────────────────────────────────────────────────────
    const courses = [
      {
        title: 'Understanding Your Dog',
        description: 'Discover how dogs think, feel, and learn. Based on Jean Donaldson\'s groundbreaking work, this course helps you see the world through your dog\'s eyes and build a relationship based on understanding, not dominance.',
        book_source: 'Culture Clash',
        author: 'Jean Donaldson',
        difficulty: 'beginner',
        thumbnail_emoji: '🐕',
        color: 'orange',
        order_index: 1,
      },
      {
        title: 'The Science of Positive Training',
        description: 'Explore the behavioral science behind effective dog training. Karen Pryor\'s revolutionary approach using reinforcement schedules will transform how you communicate with your dog.',
        book_source: "Don't Shoot the Dog",
        author: 'Karen Pryor',
        difficulty: 'beginner',
        thumbnail_emoji: '🧠',
        color: 'purple',
        order_index: 2,
      },
      {
        title: 'Practical Training Skills',
        description: 'Get hands-on with real training techniques. Pat Miller\'s step-by-step methods cover all the essential commands and help you build a well-behaved, happy dog through positive reinforcement.',
        book_source: 'The Power of Positive Dog Training',
        author: 'Pat Miller',
        difficulty: 'intermediate',
        thumbnail_emoji: '🎯',
        color: 'green',
        order_index: 3,
      },
      {
        title: 'Advanced Real-World Training',
        description: 'Apply everything you\'ve learned to real-life situations. From distractions in public to multi-dog households, this course combines insights from all four books to help you master training in any context.',
        book_source: 'Combined Sources',
        author: 'Various Authors',
        difficulty: 'advanced',
        thumbnail_emoji: '🏆',
        color: 'blue',
        order_index: 4,
      },
    ];

    const courseIds = [];
    for (const course of courses) {
      const res = await client.query(`
        INSERT INTO courses (title, description, book_source, author, difficulty, thumbnail_emoji, color, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (title, book_source) DO UPDATE SET
          description = EXCLUDED.description,
          author = EXCLUDED.author,
          difficulty = EXCLUDED.difficulty,
          thumbnail_emoji = EXCLUDED.thumbnail_emoji,
          color = EXCLUDED.color,
          order_index = EXCLUDED.order_index
        RETURNING id
      `, [course.title, course.description, course.book_source, course.author, course.difficulty, course.thumbnail_emoji, course.color, course.order_index]);
      if (res.rows[0]) courseIds.push(res.rows[0].id);
    }

    // Re-fetch course IDs in order
    const courseResult = await client.query('SELECT id FROM courses ORDER BY order_index');
    const [c1, c2, c3, c4] = courseResult.rows.map(r => r.id);

    // ─── Lessons for Course 1: Understanding Your Dog ─────────────────────────
    const course1Lessons = [
      {
        title: 'Getting the Dog\'s Perspective',
        content: `## Seeing the World Through Your Dog's Eyes

When we bring a dog into our home, we often make the mistake of assuming they experience the world the way we do. Jean Donaldson's "Culture Clash" challenges us to flip this thinking entirely.

### Dogs Are Not Furry Humans

Dogs evolved alongside humans for thousands of years, but that doesn't mean they share our values, motivations, or moral framework. A dog who chews your shoes isn't being "spiteful." A dog who jumps on guests isn't being "rude." These behaviors make perfect sense from a dog's perspective — they just don't align with our human expectations.

**The key insight:** Dogs do what works. Period. If a behavior gets rewarded (even accidentally), it will happen more. If a behavior produces no result, it will fade away.

### The "Alien in Your House" Exercise

Donaldson asks us to imagine being an alien visiting Earth. You don't speak the language, you don't understand the customs, and your hosts keep getting angry at you for behaviors that seem perfectly natural to you. That's what life is like for your dog.

Your dog didn't choose to live with you. They didn't sign a contract agreeing to your rules. They're doing their best to figure out a world that operates very differently from what their instincts tell them.

### What Dogs Are Actually Motivated By

Dogs are motivated by:
- **Food and resources** — This is their primary currency
- **Social contact** — Dogs are social animals who want connection
- **Play and stimulation** — Mental and physical engagement
- **Safety and comfort** — Avoiding things that feel threatening

Notice what's NOT on the list: "pleasing you." Dogs don't have an innate drive to make their owners happy. They want *rewards*, and when your happiness correlates with those rewards, they'll work to make you happy — but it's always about what's in it for them. And that's perfectly fine!

### Why This Matters for Training

Understanding that dogs are motivated by consequences — not by love of rules — completely changes how we train. Instead of getting frustrated when your dog "misbehaves," ask yourself: **"What reward is my dog getting for this behavior?"**

Usually, you'll find an answer. The jumping dog gets attention (even negative attention counts!). The barking dog makes the mailman go away (huge win from the dog's perspective). The counter-surfing dog occasionally finds food (intermittent reinforcement is powerful).

Once you understand the motivation, you can redirect it.`,
        key_takeaway: 'Dogs are motivated by rewards and consequences, not by a desire to please or moral understanding. Effective training starts with understanding your dog\'s perspective.',
        order_index: 1,
        reading_time_minutes: 7,
      },
      {
        title: 'What Your Dog Comes Hard-Wired With',
        content: `## Nature vs. Nurture: Your Dog's Built-In Software

Every dog comes with a set of built-in behaviors — things they're genetically predisposed to do regardless of training. Understanding these "factory settings" is essential for realistic expectations and effective training.

### The Spectrum of Hard-Wired Behaviors

**Predatory behaviors** form a sequence that varies by breed:
Orient → Stalk → Chase → Grab-bite → Kill-bite → Dissect → Consume

Border Collies excel at the stalk-chase portion (herding). Retrievers excel at the grab-bite portion (soft mouth retrieve). Terriers excel at the kill-bite portion (ratting). Greyhounds excel at orient-chase. Understanding where your dog falls on this spectrum explains a lot of "problem behaviors."

### Social Behaviors

Dogs are pack animals with complex social structures. Key social behaviors include:
- **Play signals** — The play bow communicates "what follows is play, not aggression"
- **Appeasement gestures** — Lip licking, yawning, looking away signal "I'm not a threat"
- **Stress signals** — Panting, pacing, excessive grooming indicate anxiety
- **Calming signals** — Dogs naturally use these to de-escalate tension

### Why Breeds Matter

Breeders have been selectively amplifying and dampening various aspects of dog behavior for centuries. Your Labrador's obsession with fetching things and your Beagle's tendency to follow their nose aren't personality quirks — they're genetic heritage.

**Practical implication:** If you have a herding breed, they *will* try to herd. Provide an outlet (agility, herding sports, fetch) rather than trying to suppress a fundamental drive.

### Developmental Windows

Research shows critical periods in puppy development:
- **3-12 weeks:** The socialization window — exposures made here shape the dog's lifelong reactions
- **8-10 weeks:** The fear imprint period — traumatic experiences here can have lasting effects
- **6-14 months:** Adolescence — increased risk-taking, testing limits, reduced response to cues

Missing the socialization window is one of the leading causes of fear and aggression in adult dogs. This is why responsible breeders and shelters prioritize early socialization.

### Working With Nature, Not Against It

The most successful training works *with* a dog's hard-wired tendencies:
- Use a food-motivated dog's drive to earn food as a primary reinforcer
- Give herding dogs a "job" — teach them to herd a ball or take agility classes
- Provide scent hounds with nosework games that satisfy their drive to sniff
- Allow retrievers to carry things on walks to channel their genetics productively

Fighting nature is exhausting. Channeling it is training.`,
        key_takeaway: 'Every dog has genetic predispositions that influence their behavior. Effective training works with these instincts rather than against them.',
        order_index: 2,
        reading_time_minutes: 8,
      },
      {
        title: 'Socialization, Fear, and Aggression',
        content: `## The Socialization Imperative

One of the most important investments you can make in your dog's future is proper socialization. Jean Donaldson describes socialization as the process of "inoculating" your dog against fear of the world.

### The Critical Window

Between 3 and 12 weeks of age, puppies have a remarkable ability to learn that new things are safe. During this period, their brains are literally wiring up their fear responses. Puppies exposed to a wide variety of people, animals, sounds, surfaces, and environments during this window develop more resilience as adults.

After this window closes, new experiences require more repetition and positive association to become neutral or positive.

### What Proper Socialization Looks Like

Socialization is NOT just exposure — it's **positive exposure**. Throwing a fearful puppy into a dog park is not socialization; it's flooding, and it can make things worse.

Good socialization involves:
- **Controlled, positive exposures** — New thing appears → Good things happen
- **Going at the dog's pace** — Never force interaction
- **Variety** — Men with hats, children, bicycles, umbrellas, tile floors, stairs, car rides
- **Making it fun** — Pair every new experience with high-value treats and play

### Understanding Fear in Dogs

Fear is the primary driver behind most dog aggression. The "aggressive" dog is almost always a *scared* dog. Donaldson emphasizes this point forcefully: dogs bite because they're afraid, not because they're dominant or mean.

**The fear-aggression cycle:**
1. Dog feels threatened
2. Tries appeasement signals (which humans often miss)
3. Growls (warning — humans often punish this)
4. Snaps
5. Bites

When we punish growling, we remove a warning signal without addressing the underlying fear. The dog doesn't become less scared — they just skip straight to biting.

### What To Do About Fear

**Counter-conditioning and desensitization** (CC&D) is the gold standard:
- **Desensitization:** Expose the dog to the fear trigger at a level below threshold (they notice it but don't react)
- **Counter-conditioning:** Pair that exposure with something wonderful (food, play)

Over time, the dog learns: "That thing I used to be afraid of actually predicts good things!"

This process takes patience but is remarkably effective when done correctly.

### The Management Imperative

While working on fear, **management is crucial**. Don't put a fearful dog in situations where they feel they need to bite. Use baby gates, leashes, muzzles (properly conditioned), and spatial distance to keep everyone safe while you work on behavior modification.`,
        key_takeaway: 'Fear drives most dog aggression. Proper socialization, counter-conditioning, and management are the keys to helping fearful dogs — never punishment.',
        order_index: 3,
        reading_time_minutes: 9,
      },
      {
        title: 'Why Dogs Do What They Do',
        content: `## The Consequence Machine

Dogs are consequence machines. Their behavior is shaped entirely by what happens immediately after they do something. This is the foundation of all learning science and the basis for everything in modern dog training.

### The Four Quadrants of Operant Conditioning

Behaviorists describe four ways to change behavior:

**Positive Reinforcement (+R):** Add something good → behavior increases
- Dog sits → gets a treat → sits more often ✅

**Negative Punishment (-P):** Remove something good → behavior decreases
- Dog jumps → you turn away (remove attention) → jumping decreases ✅

**Positive Punishment (+P):** Add something bad → behavior decreases
- Dog jumps → gets kneed in chest → may decrease jumping ⚠️ (with significant side effects)

**Negative Reinforcement (-R):** Remove something bad → behavior increases
- Dog pulls → prong collar hurts → dog stops pulling → pain stops → collar taught "don't pull" ⚠️

### Why Positive Reinforcement Wins

Donaldson makes a compelling case for +R over punishment:

1. **No fallout:** Punishment causes fear, stress, and aggression. +R builds confidence.
2. **Precise communication:** +R tells your dog exactly what to DO, not just what to stop.
3. **Relationship preserving:** Your dog sees you as the source of good things.
4. **You don't need to catch them doing wrong:** You just reward right.
5. **Dogs trained with +R generalize better** — they learn the *concept*, not just the specific context.

### The Myth of Dominance

The dominance theory of dog training — the idea that dogs are constantly trying to be "alpha" and you need to establish dominance — has been largely debunked by modern ethology.

Wolves (who dogs are related to but quite different from) in the wild form cooperative family units, not constantly jockeying dominance hierarchies. The "alpha roll" and related techniques are based on flawed research and can cause serious harm.

**Bottom line from Donaldson:** Your dog isn't trying to dominate you. They're trying to get what they want, just like every other living creature on Earth. Work with that, and you'll have a happy, well-behaved dog.

### Making Training Work

The key variables in effective training:
- **Timing:** The reward (or consequence) must happen within 1-2 seconds of the behavior
- **Value:** Use rewards your dog actually wants in that moment
- **Rate of reinforcement:** In early training, reward frequently — every time
- **Clarity:** Be consistent about what earns a reward`,
        key_takeaway: 'Dogs learn through consequences. Positive reinforcement is the most effective and humane training method, producing lasting results without harmful side effects.',
        order_index: 4,
        reading_time_minutes: 8,
      },
    ];

    for (const lesson of course1Lessons) {
      const res = await client.query(`
        INSERT INTO lessons (course_id, title, content, key_takeaway, order_index, reading_time_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (course_id, title) DO UPDATE SET
          content = EXCLUDED.content,
          key_takeaway = EXCLUDED.key_takeaway,
          order_index = EXCLUDED.order_index,
          reading_time_minutes = EXCLUDED.reading_time_minutes
        RETURNING id
      `, [c1, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);

      // Create quiz for each lesson
      const quizRes = await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
        ON CONFLICT (lesson_id) DO UPDATE SET title = EXCLUDED.title
        RETURNING id
      `, [res.rows[0].id, `Quiz: ${lesson.title}`]);
    }

    // ─── Quiz Questions for Course 1 ──────────────────────────────────────────
    const lessonResults = await client.query('SELECT id FROM lessons WHERE course_id = $1 ORDER BY order_index', [c1]);
    const quizResults = await client.query(`
      SELECT q.id, q.lesson_id FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = $1 ORDER BY l.order_index
    `, [c1]);

    const c1QuizQuestions = [
      // Lesson 1 quiz
      [
        { question: "According to Jean Donaldson, what primarily motivates dogs?", options: ["A desire to please their owners", "Rewards and consequences", "Loyalty and love", "Pack hierarchy"], correct: 1, explanation: "Dogs are motivated by rewards and consequences — what's in it for them. They don't have an innate drive to please humans." },
        { question: "What is the 'Alien in Your House' exercise meant to illustrate?", options: ["Dogs are intelligent like aliens", "Dogs experience confusion in human environments", "Dogs communicate through signals", "Dogs need space exploration"], correct: 1, explanation: "The exercise helps us understand how confusing human expectations can be for dogs who don't inherently understand our rules or language." },
        { question: "If a dog jumps and gets attention (even scolding), what is likely to happen?", options: ["Jumping will decrease", "Jumping will increase", "Jumping will stay the same", "The dog will learn a new behavior"], correct: 1, explanation: "Any attention — even negative attention — can reinforce behavior. Jumping that gets attention (yelling, pushing away) often increases because the dog got what they wanted: a reaction." },
      ],
      // Lesson 2 quiz
      [
        { question: "What is the predatory sequence in dogs?", options: ["Eat, sleep, play, repeat", "Orient, stalk, chase, grab-bite, kill-bite, dissect, consume", "Sniff, dig, bark, bite", "Run, jump, fetch, retrieve"], correct: 1, explanation: "The full predatory sequence is Orient → Stalk → Chase → Grab-bite → Kill-bite → Dissect → Consume. Breeds were developed by emphasizing different parts of this sequence." },
        { question: "What is the critical socialization window for puppies?", options: ["Birth to 3 weeks", "3 to 12 weeks", "3 to 6 months", "6 to 12 months"], correct: 1, explanation: "The critical socialization window is 3-12 weeks. During this time, puppies are most receptive to learning that new things are safe." },
        { question: "If a herding breed keeps trying to herd children or other pets, what is the best approach?", options: ["Punish the herding behavior", "Keep the dog in a crate", "Provide appropriate outlets like agility or herding sports", "Ignore the behavior"], correct: 2, explanation: "Herding is a genetic drive. The best approach is to channel it productively through sports, games, or activities that satisfy the instinct rather than fighting it." },
      ],
      // Lesson 3 quiz
      [
        { question: "What is the primary driver behind most dog aggression?", options: ["Dominance", "Territorial instinct", "Fear", "Hunger"], correct: 2, explanation: "According to Donaldson, fear is the primary driver behind most dog aggression. 'Aggressive' dogs are almost always scared dogs." },
        { question: "What is the danger of punishing a dog's growl?", options: ["It confuses the dog", "It removes a warning signal without addressing the underlying fear", "It makes the dog bark instead", "It has no real effect"], correct: 1, explanation: "Punishing growling removes the warning signal but doesn't address the fear. The dog may then skip straight to biting without warning." },
        { question: "What does CC&D stand for in dog training?", options: ["Commands, Corrections and Drills", "Counter-Conditioning and Desensitization", "Communication, Control and Direction", "Consistent Conditioning and Direction"], correct: 1, explanation: "CC&D stands for Counter-Conditioning and Desensitization — the gold standard approach for treating fear-based behaviors in dogs." },
      ],
      // Lesson 4 quiz
      [
        { question: "In positive reinforcement, what happens to increase a behavior?", options: ["Something bad is added", "Something good is removed", "Something good is added", "Something bad is removed"], correct: 2, explanation: "Positive Reinforcement means adding something good (+) which causes the behavior to increase (reinforcement). Dog sits → gets treat → sits more often." },
        { question: "Within how many seconds should a reward follow a behavior to be effective?", options: ["5-10 seconds", "Within 30 seconds", "1-2 seconds", "It doesn't matter as long as you reward eventually"], correct: 2, explanation: "Timing is critical — the reward must happen within 1-2 seconds of the behavior for the dog to connect the reward to the specific thing they did." },
        { question: "The dominance theory of dog training (alpha rolls, etc.) is:", options: ["The most effective approach for large breeds", "Based on sound scientific research", "Largely debunked and potentially harmful", "Required for working dogs"], correct: 2, explanation: "The dominance theory has been largely debunked by modern ethology. Dogs aren't trying to dominate you — they're trying to get what they want. Dominance-based techniques can cause fear and aggression." },
      ],
    ];

    for (let i = 0; i < quizResults.rows.length && i < c1QuizQuestions.length; i++) {
      const quizId = quizResults.rows[i].id;
      const questions = c1QuizQuestions[i];
      for (let j = 0; j < questions.length; j++) {
        const q = questions[j];
        await client.query(`
          INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (quiz_id, order_index) DO UPDATE SET
            question = EXCLUDED.question,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation
        `, [quizId, q.question, JSON.stringify(q.options), q.correct, q.explanation, j]);
      }
    }
    console.log('✅ Course 1 seeded');

    // ─── Lessons for Course 2: The Science of Positive Training ──────────────
    const course2Lessons = [
      {
        title: 'How Reinforcement Really Works',
        content: `## The Laws of Learning

Karen Pryor's "Don't Shoot the Dog" is one of the most influential books ever written on behavioral science and training. At its core is a simple but profound idea: **all behavior is governed by its consequences.**

### What is a Reinforcer?

A reinforcer is anything that increases the likelihood of a behavior being repeated. There are two types:

**Primary reinforcers** — Things that are inherently rewarding without any learning:
- Food (especially high-value treats)
- Water when thirsty
- Play
- Social contact

**Secondary (conditioned) reinforcers** — Things that become rewarding through association:
- Clickers
- Marker words ("Yes!")
- Praise (if the dog has learned it predicts something good)

### Schedules of Reinforcement

This is where training science gets really interesting. *When* you reinforce matters as much as *whether* you reinforce.

**Continuous Reinforcement (CRF):** Every correct behavior is rewarded. Best for teaching new behaviors — the dog learns quickly what earns rewards.

**Variable Ratio (VR):** Reward happens after an unpredictable number of correct behaviors. Creates the strongest, most resistant-to-extinction behavior. Think of a slot machine — you never know when it'll pay out, so you keep pulling.

**Fixed Interval (FI):** Reward happens after a fixed time period. Creates a "scallop" pattern — behavior drops off right after reward, picks up right before the next expected reward.

**Practical application:** Teach with CRF. Then move to VR to make the behavior bulletproof. This is why "fading the treats" works — you shift to a VR schedule, and behavior actually becomes stronger because it's no longer predictable.

### The Clicker Revolution

The clicker is a precise timing tool that "marks" the exact behavior you want to reward. Because it's a unique, consistent sound, dogs learn very quickly that CLICK = reward is coming.

The sequence is:
1. Dog does the behavior
2. CLICK (within 1-2 seconds)
3. Reward follows

Even if the reward comes 10 seconds later, the click has "marked" the exact moment. This solves the timing problem in training.

### Why Food Works

Many people resist using food in training because it feels like "bribery." Pryor addresses this directly: food is not a bribe, it's a reward. A bribe is given *before* the behavior. A reward comes *after*.

Food is effective because:
- It's a primary reinforcer (no learning required to find it valuable)
- It's easy to deliver quickly
- It can be given in tiny pieces many times
- Most dogs are highly motivated by it

If your dog isn't responding to food, either the food isn't valuable enough (try real meat or cheese) or the environment is too distracting.`,
        key_takeaway: 'Reinforcers drive behavior. Understanding reinforcement schedules — especially moving from continuous to variable — creates reliable, lasting behavior.',
        order_index: 1,
        reading_time_minutes: 9,
      },
      {
        title: 'Shaping: Building Behaviors Step by Step',
        content: `## The Art and Science of Shaping

Shaping is one of the most powerful tools in a trainer's toolkit. It's the process of teaching complex behaviors by rewarding successive approximations — small steps that gradually move toward the final goal.

### The Shaping Process

Imagine you want to teach your dog to put a toy in a box. You can't just wait for them to do it perfectly — they'd never figure it out. Instead, you shape:

1. **Reward** looking at the box
2. **Reward** moving toward the box
3. **Reward** touching the box with a paw
4. **Reward** touching the toy
5. **Reward** picking up the toy
6. **Reward** moving toward the box with toy
7. **Reward** dropping toy near the box
8. **Reward** dropping toy IN the box

Each step is a "criteria" — and you only raise criteria when the dog is succeeding at the current step about 80% of the time.

### The 10 Laws of Shaping (Karen Pryor)

1. Raise criteria in small enough increments that the subject always succeeds
2. Train one aspect of a behavior at a time
3. Before raising criteria, get a reliable response at the current level
4. When introducing a new criterion, relax the old ones temporarily
5. Plan ahead — know what you're working toward
6. Don't interrupt a training session while the dog is working well
7. Don't end a session on a failed attempt — end on a success
8. If you're losing a behavior, go back to a previous reinforced step
9. Don't change trainers mid-session — consistency matters
10. If you're having trouble, ask: is it the training or the animal?

### Targeting

Targeting is a foundational shaping skill: teaching the dog to touch a target (usually your hand or a stick) with their nose. From this simple behavior, you can teach:
- Sit (target moves over and behind head)
- Down (target moves to floor between paws)
- Heel (target held at hip position)
- Roll over (target goes around in a circle)
- Complex tricks (through sequences of targets)

Teaching targeting first gives you a tool that makes all subsequent training faster and cleaner.

### Capturing vs. Shaping vs. Luring

**Capturing:** Waiting for the dog to naturally do the behavior, then marking and rewarding it. Great for behaviors dogs do naturally (sitting, lying down, yawning for "tired" cue).

**Shaping:** Rewarding successive approximations toward a goal. Best for novel behaviors.

**Luring:** Using food to guide the dog's body into position, then fading the lure. Fast and easy for teaching position cues.

Each has its place. A skilled trainer uses all three depending on the behavior and the dog.`,
        key_takeaway: 'Shaping breaks complex behaviors into small, achievable steps. Reward successive approximations and raise criteria gradually to build any behavior you can imagine.',
        order_index: 2,
        reading_time_minutes: 8,
      },
      {
        title: 'What NOT to Do: Avoiding Common Training Mistakes',
        content: `## The Road to Bad Training Is Paved With Good Intentions

Even the most well-meaning dog owners make training mistakes that can slow progress or cause problems. Karen Pryor's work helps us identify and avoid the most common pitfalls.

### Mistake 1: Punishing What You Don't Want vs. Reinforcing What You Do

Most dog owners focus on correcting bad behavior rather than teaching good behavior. The problem: punishment tells your dog what NOT to do, but not what TO do instead.

**Better approach:** Ask yourself "What do I want the dog to do instead?" and train *that* behavior. A dog that's sitting can't be jumping. A dog that's lying on their mat can't be begging at the table.

### Mistake 2: Inconsistent Reinforcement (The Wrong Kind)

You've probably heard "be consistent." But there are two types of inconsistency:

*Good inconsistency:* Variable reinforcement schedule — sometimes reward, sometimes don't (after behavior is trained). This strengthens behavior.

*Bad inconsistency:* Sometimes allowing a behavior, sometimes correcting it. Let your dog jump when you're in play clothes, but correct them when in work clothes? You've just taught them to read your clothing, not to stop jumping.

**Rule:** If you don't want the behavior ever, never allow it.

### Mistake 3: The Poisoned Cue

A poisoned cue happens when a cue has been paired with punishment or frustration. If you say "Come!" and your dog doesn't come, then you go get them and scold them — the word "Come" now predicts bad things.

**Protect your cues:** Never use a cue you can't enforce. Never call your dog to you for something they find unpleasant (nail trims, baths, crate time). Go get them instead.

### Mistake 4: Bribing Instead of Rewarding

If your dog only performs when they can see the treat in your hand, you've accidentally trained treat-dependency. The treat should be a surprise that comes *after* the behavior, not a visible prompt before it.

**Fix:** Train with treats hidden in your pocket or on a nearby table. Mark the behavior, then go get the treat. The cue (hand signal or word) should predict the behavior, and the behavior predicts the reward.

### Mistake 5: Training When You're Frustrated

Dogs are exquisitely sensitive to human emotion. When you're frustrated, your timing worsens, your criteria become unclear, and you're more likely to revert to punishment. Your dog picks up on your stress and becomes anxious.

**Rule:** Keep sessions short (5-10 minutes max), end on success, and if you're getting frustrated — stop. Do something your dog already knows well, reward them generously, and come back tomorrow.

### Mistake 6: Expecting Too Much Too Fast

Learning takes time and repetition. A behavior learned in the living room will need to be re-taught at the park, at a friend's house, and anywhere the environment is different. Dogs don't generalize well — they learn "sit in kitchen" before they learn "sit everywhere."

**Practical approach:** Introduce new behaviors in low-distraction environments. Gradually increase difficulty by adding distance, duration, and distraction one at a time (the 3 D's).`,
        key_takeaway: 'Avoid common pitfalls: be consistent about rules, protect your cues from punishment, train rewards not bribes, keep sessions short and positive, and generalize behaviors across environments.',
        order_index: 3,
        reading_time_minutes: 8,
      },
    ];

    for (const lesson of course2Lessons) {
      const res = await client.query(`
        INSERT INTO lessons (course_id, title, content, key_takeaway, order_index, reading_time_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (course_id, title) DO UPDATE SET
          content = EXCLUDED.content,
          key_takeaway = EXCLUDED.key_takeaway,
          order_index = EXCLUDED.order_index,
          reading_time_minutes = EXCLUDED.reading_time_minutes
        RETURNING id
      `, [c2, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);
      await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
        ON CONFLICT (lesson_id) DO UPDATE SET title = EXCLUDED.title
      `, [res.rows[0].id, `Quiz: ${lesson.title}`]);
    }

    const c2QuizResults = await client.query(`
      SELECT q.id FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = $1 ORDER BY l.order_index
    `, [c2]);

    const c2Questions = [
      [
        { question: "What is a secondary (conditioned) reinforcer?", options: ["Food and water", "Something that becomes rewarding through association, like a clicker", "Physical touch and petting", "A punishment that stops bad behavior"], correct: 1, explanation: "Secondary reinforcers like clickers or marker words become rewarding through their association with primary reinforcers (like food)." },
        { question: "Which reinforcement schedule creates the strongest, most resistant behavior?", options: ["Continuous Reinforcement", "Fixed Interval", "Variable Ratio", "Fixed Ratio"], correct: 2, explanation: "Variable Ratio creates the strongest behavior — like a slot machine, the unpredictability of when the reward comes makes the behavior very persistent." },
        { question: "When should you use a clicker?", options: ["Before you give a command", "Exactly when the behavior occurs, within 1-2 seconds", "After you've given the reward", "Whenever the dog looks at you"], correct: 1, explanation: "The clicker marks the exact moment of the correct behavior. It should happen within 1-2 seconds of the behavior to effectively communicate what earned the reward." },
      ],
      [
        { question: "In shaping, you should raise criteria when the dog succeeds approximately what percentage of the time?", options: ["50%", "60%", "80%", "100%"], correct: 2, explanation: "Raise criteria when the dog is succeeding about 80% of the time at the current level — often enough to show understanding, with room for challenge." },
        { question: "What is 'targeting' in dog training?", options: ["Teaching a dog to aim at a specific location", "Teaching a dog to touch a designated target with their nose or paw", "Using a laser pointer for training", "Training the dog to focus on you"], correct: 1, explanation: "Targeting means teaching the dog to touch a specific object (hand, stick, disc) with their nose or paw. It's a foundational skill that can be used to teach many other behaviors." },
        { question: "Which method involves waiting for a dog to naturally perform a behavior and then marking it?", options: ["Shaping", "Luring", "Capturing", "Targeting"], correct: 2, explanation: "Capturing means waiting for the dog to naturally perform a behavior (like a yawn or a stretch) and immediately marking and rewarding it." },
      ],
      [
        { question: "What is a 'poisoned cue'?", options: ["A toxic training tool", "A cue that has been associated with punishment or negative outcomes", "A cue used in dangerous situations", "A cue that was never properly taught"], correct: 1, explanation: "A poisoned cue is one that has been paired with punishment or negative experiences, making the dog hesitant or anxious when they hear it." },
        { question: "The '3 D's' of generalizing behaviors refer to:", options: ["Direction, Distance, Duration", "Distance, Duration, Distraction", "Drive, Discipline, Direction", "Delay, Difficulty, Distraction"], correct: 1, explanation: "The 3 D's are Distance (how far away you are), Duration (how long the behavior is held), and Distraction (what's happening in the environment). Increase each separately." },
        { question: "If you're getting frustrated during training, the best approach is to:", options: ["Push through it to show dominance", "Increase the difficulty to challenge the dog", "End the session on a success and come back tomorrow", "Switch to correction-based methods"], correct: 2, explanation: "Frustration ruins timing and increases the likelihood of punishment. Always end sessions on a success — even a simple one — and return when you're in a better mindset." },
      ],
    ];

    for (let i = 0; i < c2QuizResults.rows.length && i < c2Questions.length; i++) {
      const quizId = c2QuizResults.rows[i].id;
      for (let j = 0; j < c2Questions[i].length; j++) {
        const q = c2Questions[i][j];
        await client.query(`
          INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (quiz_id, order_index) DO UPDATE SET
            question = EXCLUDED.question,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation
        `, [quizId, q.question, JSON.stringify(q.options), q.correct, q.explanation, j]);
      }
    }
    console.log('✅ Course 2 seeded');

    // ─── Lessons for Course 3: Practical Training Skills ──────────────────────
    const course3Lessons = [
      {
        title: 'The Foundation Behaviors: Sit, Down, and Stay',
        content: `## Building Your Dog's Training Foundation

Pat Miller's "The Power of Positive Dog Training" is a practical handbook. Let's get to work on the behaviors every dog should know.

### Teaching Sit

**Lure method (fastest for beginners):**
1. Hold a treat at your dog's nose
2. Slowly move the treat back over their head
3. As their head goes back, their bottom will go down
4. The instant their bottom touches the floor: **mark** (click or "yes!") and **reward**
5. Repeat 10-15 times per session

**Common mistakes:**
- Moving the treat too fast (dog jumps up)
- Treating before the sit is complete
- Not practicing in different locations

**Adding the cue:**
Once your dog is offering the sit reliably (8/10 times), add the verbal cue "Sit" just before you give the hand signal. After 50-100 repetitions, the word becomes meaningful.

### Teaching Down

Down is often harder than sit because it puts dogs in a vulnerable position. Be patient.

**From a sit:**
1. Hold treat at dog's nose in a sit
2. Slowly lower the treat straight down between their front paws
3. As elbows touch the floor: mark and reward
4. If they're having trouble, try luring under your slightly raised knee

**The crawl under:** Some dogs respond well to luring under a low table or under your leg to get that elbow-drop.

### Teaching Stay

Stay is actually THREE behaviors in one:
- **Duration:** Holding the position for increasing time
- **Distance:** Maintaining position while you move away
- **Distraction:** Holding position while things happen around them

Train these separately!

**Duration first:**
1. Ask for a sit
2. Count 1 second silently, then mark and reward
3. Gradually increase: 2 seconds, 3 seconds, 5, 10, 20...
4. Release with a cue: "Okay!" or "Free!"

**Distance next (only after 30-second duration is solid):**
1. Ask for sit-stay
2. Take ONE step back, step back in, mark and reward
3. Gradually increase distance
4. Always return to the dog to reward (don't call them out of stay yet)

**Golden rule of stay:** If the dog breaks, you've moved too fast. Go back to where they were succeeding.

### The Release Cue

A release cue is crucial — it tells your dog "you're done, you can move." Without it, your dog will start to self-release (decide when they're done themselves).

Common release words: "Okay," "Free," "Break," "Release"
Use only one, use it consistently, and celebrate it — make freedom feel like a reward!`,
        key_takeaway: 'Teach sit and down through luring, then fade the lure. Build stay by training duration, distance, and distraction separately. Always release with a cue.',
        order_index: 1,
        reading_time_minutes: 10,
      },
      {
        title: 'Come When Called: The Most Important Behavior',
        content: `## Recall: The Potentially Life-Saving Behavior

A reliable recall — your dog coming when called — can literally save your dog's life. It can also prevent a lot of everyday frustration. Pat Miller dedicates significant attention to this skill because it's the one most owners get wrong.

### Why Recall Fails

Most dogs who don't come when called have learned that "Come" means:
- Fun is over (you're leaving the park)
- Something unpleasant is about to happen (bath, nail trim)
- They'll be confined (crate or house)

Dogs are smart. If coming to you consistently predicts bad things, they'll avoid it.

### Building an Emergency Recall

The emergency recall uses a special word (different from your everyday "Come") that ALWAYS predicts the most amazing reward your dog can imagine — real meat, cheese, or whatever drives them wild.

**Building it:**
1. Choose a unique word: "Cookie!" "Jackpot!" "Here!" — something not in your regular vocabulary
2. At random times when your dog isn't expecting it: say the word in a happy voice
3. Give 5-10 tiny, wonderful treats in rapid succession
4. Do this 2-3 times a day for several weeks
5. Your dog will learn this word = absolute jackpot

**Using it:** Only use the emergency recall word when you truly need it (dog running toward traffic, escaped from yard). Because it's been so heavily reinforced and rarely used, it will work.

### The Long Line Method

For teaching recall in real-world situations before your dog is ready to be off-leash:

1. Attach a 15-30 foot long line (not a retractable leash)
2. Let the dog explore
3. When they're at a distance and somewhat distracted, call in a happy voice: "Fido, Come!"
4. Run backwards (dogs love to chase)
5. When they reach you: PARTY — treats, praise, play, all of it
6. Occasionally, just pet them and let them go back to playing (recall doesn't always mean fun ends)

**The rule:** Never punish a dog who comes to you, even if it took forever. If you're frustrated by the time they arrive, plaster on a smile and reward anyway. The dog only knows they came to you — that should always be wonderful.

### Real-World Proofing

A recall trained only in the backyard will not work at the dog park. You must proof recall:
- In different environments
- With increasing levels of distraction
- At varying distances
- Multiple times a day in low-stakes situations

Every time your dog comes to you and gets rewarded, the behavior gets stronger. Make "Come" the best word in your dog's vocabulary.`,
        key_takeaway: 'Recall must always predict wonderful things. Build an emergency recall with a special word and the best treats. Never punish a dog who comes to you — no matter how long it took.',
        order_index: 2,
        reading_time_minutes: 8,
      },
      {
        title: 'Leash Walking: The Art of Loose-Leash Walking',
        content: `## Walking Nicely on a Leash

Loose-leash walking is one of the most commonly cited frustrations for dog owners — and one of the most trainable skills when approached correctly.

### Why Dogs Pull

Dogs pull because pulling works. When a dog pulls forward and the human follows, the dog gets to go where they wanted. Over thousands of walks, pulling has been heavily reinforced. It's not bad behavior — it's a perfectly rational strategy that has reliably worked.

### The Fundamental Rule

**The leash is a safety net, not a steering wheel.** You want your dog to choose to stay near you because good things happen there — not because they're mechanically constrained.

### Method 1: Be a Tree

When the leash tightens:
1. Stop completely. Become a tree.
2. Wait (silently, no nagging)
3. When the dog turns back and creates slack: mark and reward
4. Continue walking
5. Repeat every time the leash tightens

This is slow at first. You may only walk 10 feet in 10 minutes. But your dog learns: pulling = stops, loose leash = forward movement.

### Method 2: Direction Changes

1. Walk in any direction
2. The moment the leash tightens: turn and walk the opposite direction (cheerfully, not jerkily)
3. Mark and reward when dog catches up to your side
4. Repeat

Your dog learns: keeping up with you is profitable, pulling means you change direction.

### Method 3: Reward Positioning

Simply reward your dog frequently for being in the right place — at your side with a loose leash. Don't wait for pulling to happen:

1. Walk
2. Every 3-5 steps when your dog is in position: mark and reward
3. Gradually increase the steps between rewards
4. Your dog learns: being beside you is where the good stuff happens

### Equipment Considerations

**What works well:**
- Standard flat buckle collar or harness
- Front-clip harness (reduces pulling power without pain)
- Head halter (gentle control — requires careful introduction)

**What doesn't work (and why):**
- Choke chains — cause tracheal damage, create negative associations
- Prong collars — pain-based, cause fear and aggression
- Retractable leashes — teach your dog that pulling gets more leash (counterproductive)

### Managing the Walk

Real walks have two components:
1. **Sniff time** — dogs experience the world through their nose; sniffing is mentally enriching. Let your dog sniff on a loose leash.
2. **Training time** — periods where you practice loose-leash walking

You don't need to train every step of every walk. But dedicated 5-10 minute training periods during walks will build the skill.`,
        key_takeaway: 'Dogs pull because it works. Stop the reinforcement of pulling (be a tree, change direction) and heavily reward loose-leash position. Make walking beside you the most rewarding place to be.',
        order_index: 3,
        reading_time_minutes: 9,
      },
    ];

    for (const lesson of course3Lessons) {
      const res = await client.query(`
        INSERT INTO lessons (course_id, title, content, key_takeaway, order_index, reading_time_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (course_id, title) DO UPDATE SET
          content = EXCLUDED.content,
          key_takeaway = EXCLUDED.key_takeaway,
          order_index = EXCLUDED.order_index,
          reading_time_minutes = EXCLUDED.reading_time_minutes
        RETURNING id
      `, [c3, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);
      await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
        ON CONFLICT (lesson_id) DO UPDATE SET title = EXCLUDED.title
      `, [res.rows[0].id, `Quiz: ${lesson.title}`]);
    }

    const c3QuizResults = await client.query(`
      SELECT q.id FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = $1 ORDER BY l.order_index
    `, [c3]);

    const c3Questions = [
      [
        { question: "When teaching 'Stay', which element should you train first?", options: ["Distraction", "Distance", "Duration", "Direction"], correct: 2, explanation: "Duration should be trained first — the dog must hold the position for increasing lengths of time before you add distance or distraction." },
        { question: "What is the purpose of a release cue?", options: ["To signal the dog to sit", "To tell the dog they are done and free to move", "To call the dog to you", "To reward good behavior"], correct: 1, explanation: "A release cue tells the dog 'you're done, you can move now.' Without it, dogs will self-release — deciding on their own when stay is over." },
        { question: "When luring a 'Down,' where should you move the treat?", options: ["Over the dog's head", "Straight forward away from the dog", "Straight down between the dog's front paws", "To the side of the dog"], correct: 2, explanation: "Move the treat straight down between the dog's front paws. As they follow it down, their elbows will drop to the floor." },
      ],
      [
        { question: "An emergency recall word should be:", options: ["The same as your everyday 'Come' command", "A unique word that always predicts the best reward possible", "A stern command word", "Whatever word the dog already knows"], correct: 1, explanation: "The emergency recall uses a special word (different from everyday 'Come') that always predicts jackpot rewards. Its rarity and consistent reward history make it reliable in emergencies." },
        { question: "If a dog is slow to come when called, when they finally arrive you should:", options: ["Scold them for taking so long", "Reward them enthusiastically, regardless of how long it took", "Ignore them as punishment for the delay", "Put them on leash immediately"], correct: 1, explanation: "Always reward a dog who comes to you, even if it took a long time. The dog only knows they came — that should always be wonderful. Punishment teaches them that coming to you is bad." },
        { question: "What is the long line method primarily used for?", options: ["Keeping dogs safe at the beach", "Teaching recall in real environments before the dog is ready to be off-leash", "Preventing pulling on regular walks", "Teaching the dog to stay"], correct: 1, explanation: "A long line (15-30 foot training leash) allows you to practice recall in real environments and with some distractions, while keeping the dog safe before they have a reliable off-leash recall." },
      ],
      [
        { question: "Why do dogs pull on the leash?", options: ["To show dominance over the owner", "Because they haven't been punished enough for it", "Because pulling has reliably worked — they get to go where they want", "Because they have too much energy"], correct: 2, explanation: "Dogs pull because pulling works. When a dog pulls and the human follows, the dog gets to go where they wanted. It's perfectly rational behavior that has been accidentally reinforced." },
        { question: "The 'Be a Tree' method involves:", options: ["Standing still and waiting whenever the leash gets tight", "Using a tree post to attach the leash", "Walking around trees to tire the dog out", "Rewarding the dog near trees"], correct: 0, explanation: "Be a Tree means: when the leash tightens, stop completely and wait. When the dog creates slack, mark and reward. The dog learns that pulling stops forward movement." },
        { question: "Which type of collar is generally recommended for leash training?", options: ["Prong collar for better control", "Choke chain for quick corrections", "Front-clip harness which reduces pulling without pain", "Retractable leash for freedom"], correct: 2, explanation: "Front-clip harnesses are recommended — they reduce pulling power by redirecting the dog sideways without causing pain or creating negative associations." },
      ],
    ];

    for (let i = 0; i < c3QuizResults.rows.length && i < c3Questions.length; i++) {
      const quizId = c3QuizResults.rows[i].id;
      for (let j = 0; j < c3Questions[i].length; j++) {
        const q = c3Questions[i][j];
        await client.query(`
          INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (quiz_id, order_index) DO UPDATE SET
            question = EXCLUDED.question,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation
        `, [quizId, q.question, JSON.stringify(q.options), q.correct, q.explanation, j]);
      }
    }
    console.log('✅ Course 3 seeded');
    // ─── Lessons for Course 4: Advanced Real-World Training ───────────────────
    const course4Lessons = [
      {
        title: 'Training in Real Environments',
        content: `## Taking Your Training Off the Mat

Most training starts in the living room — low distraction, familiar surroundings, a willing dog. But the real world is nothing like your living room. Cars backfire. Squirrels sprint. Children scream. Other dogs appear out of nowhere. This lesson is about bridging the gap between training sessions and real life.

### Why Dogs Struggle Outdoors

A dog who sits perfectly at home may blow you off completely at the park. This isn't disobedience — it's a failure to generalize. Dogs are highly context-specific learners. They don't automatically transfer a behavior from one environment to another; you have to teach it in each new context.

This is sometimes called "stimulus control breakdown." The dog has learned to sit when you say "sit" in the kitchen, with no competing distractions, with treats on the counter. Take any of those variables away and the behavior degrades.

### The Three-Phase Approach

**Phase 1: Foundation (controlled environment)**
Build the behavior to fluency in a low-distraction environment. The dog should be responding reliably — about 90% of the time — before you add any difficulty.

**Phase 2: Proofing (introduce variables one at a time)**
Add distance, then duration, then distraction — but never more than one at a time. If you add distance and distraction simultaneously, you're setting the dog up to fail.

**Phase 3: Generalization (new environments)**
Practice in new locations systematically. Start with slightly more distracting environments (quiet neighborhood, empty parking lot) before moving to highly distracting ones (busy park, pet store).

### Practical Tips for Real-World Training

- **Go below threshold**: In a new environment, temporarily lower your criteria. Ask for easier behaviors than you would at home.
- **High-value rewards**: Real-world distractions are powerful. Your treat needs to compete. Use real meat, cheese, or whatever your dog finds irresistible.
- **Short sessions**: 3–5 minutes of focused training in a new environment beats 30 minutes of struggling.
- **End on success**: Always finish with something the dog does easily so they leave the environment on a positive note.
- **Increase gradually**: Don't jump from the living room to the dog park. Build up: driveway → quiet street → park edge → park interior.`,
        key_takeaway: 'Behaviors learned at home don\'t automatically transfer to new environments. Generalization must be trained systematically by practicing in progressively more distracting locations, one variable at a time.',
        order_index: 0,
        reading_time_minutes: 10,
      },
      {
        title: 'Managing Multi-Dog Households',
        content: `## When You Have More Than One Dog

Training one dog is challenging. Training two or more — especially with different temperaments, ages, and training histories — adds an entirely new layer of complexity. This lesson covers how to manage and train a multi-dog household successfully.

### The Core Challenge: Competing for Resources

Most conflict in multi-dog homes comes down to resources: food, space, attention, toys, resting spots. Dogs don't share naturally — they negotiate through body language and, sometimes, conflict. Your job is to manage resources strategically so conflict doesn't arise.

**Key resource-management rules:**
- Feed dogs separately — in different rooms or with barriers — to prevent food guarding
- Give high-value chews (bones, Kongs) with dogs separated
- Have enough resting spots that no one needs to compete
- Greet and give attention to dogs individually, not as a group

### Training Dogs Individually First

Every dog in the household needs individual training time. If you always train them together, they'll learn to work as a pack — not independently. One dog who knows a command will cue the other to respond, and you'll never know if each dog truly understands the behavior.

**The rule:** Get each behavior to 90% reliability with each dog alone before training them together.

### Managing the Chaos of Group Training

Once dogs are individually reliable, you can begin training them together. Start with management:

1. **One dog on leash, one free** — work the leashed dog while the other is nearby but not interfering
2. **Both on leash** — practice sits, stays, and place behaviors with both dogs simultaneously
3. **Take turns** — cue Dog A, reward, then cue Dog B, reward. This teaches patience and impulse control.

### Introducing a New Dog

When adding a dog to the household, go slowly. The existing dog(s) should meet the newcomer on neutral ground (not at home), on leash, in parallel — walking together before greeting face to face. Don't force it. Let them set the pace.

For the first few weeks at home, manage carefully: separate feeding, supervised greetings, crates or gates when unsupervised. Most dogs take 2–3 weeks to settle into a new household dynamic.`,
        key_takeaway: 'Multi-dog homes require strategic resource management to prevent conflict, and each dog must be trained individually before group training begins. Slow, supervised introductions are essential when adding a new dog.',
        order_index: 1,
        reading_time_minutes: 11,
      },
      {
        title: 'Working Through Distractions',
        content: `## Teaching Your Dog to Focus When It Counts

Distractions are everywhere — other dogs, people, food on the ground, wildlife, traffic, children. A dog who can focus and respond to cues despite distractions is a genuinely well-trained dog. This lesson gives you a systematic approach.

### Understanding Threshold

"Threshold" refers to the point at which a dog becomes too aroused or anxious to think clearly and respond to training. When a dog is over threshold, the thinking brain essentially shuts down and instinct takes over.

Signs a dog is at or over threshold:
- Lunging, barking, whining
- Hard staring at the distraction
- Unable to take treats they normally love
- Ignoring their name or known cues

**The goal of distraction training is to work just below threshold** — close enough to the distraction that the dog notices it, but not so close they lose their mind.

### The Distraction Hierarchy

Not all distractions are equal. Build a rough hierarchy for your dog:

Low: a person walking by → Medium: another dog at a distance → High: a squirrel running → Extreme: food dropped on the ground

Start your distraction training at the LOW end and work up systematically. Never jump to high-level distractions before the dog is solid at lower levels.

### Look at That (LAT)

One of the most effective techniques for distraction training is "Look at That" (Leslie McDevitt, Control Unleashed). Instead of asking the dog to ignore the distraction, you mark and reward the dog FOR noticing it.

How it works:
1. Dog sees distraction → mark ("yes!") → reward
2. Dog looks at distraction → looks back at you → jackpot reward
3. Eventually: dog sees distraction → automatically looks at you

This technique changes the emotional response to the distraction. The dog learns that seeing the distraction predicts rewards — and starts looking to you for guidance rather than reacting.

### Engagement Games

Building engagement — your dog's desire to check in with you — is the foundation of distraction proofing. Practice these:

- **Hand targeting**: dog touches your palm with their nose on cue, even near distractions
- **Name game**: say dog's name, mark and reward when they look at you — build this in increasingly distracting environments
- **Ready?**: use an attention cue before asking for any behavior in a distracting environment`,
        key_takeaway: 'Distraction training requires working below the dog\'s threshold and building up gradually. Techniques like "Look at That" change the emotional response to distractions — turning triggers into cues to check in with you.',
        order_index: 2,
        reading_time_minutes: 10,
      },
      {
        title: 'Building a Reliable, Confident Dog',
        content: `## The Long Game: Training for Life

A well-trained dog isn't just a dog who knows commands — it's a dog who is confident, emotionally resilient, and genuinely enjoys working with you. This final lesson is about the bigger picture: building a dog you can take anywhere and trust in any situation.

### Confidence vs. Obedience

Traditional training focused almost exclusively on obedience: sit, stay, come, down, heel. But a dog can know all those commands and still be anxious, reactive, or unreliable under pressure.

Real reliability comes from confidence — a dog who trusts that the world is safe, that new experiences are interesting rather than threatening, and that you are a reliable guide through it all.

**How to build confidence:**
- Expose to novelty early and often (new surfaces, sounds, environments, people)
- Let the dog problem-solve — don't over-help or rush to rescue them from minor challenges
- Use play as a training tool — a dog who plays with you in a new environment is a confident dog
- Celebrate "brave" moments: when your dog approaches something unfamiliar, mark and reward generously

### The Relationship Is the Foundation

Every technique in this program works better on a foundation of a strong relationship. A dog who trusts you, enjoys your company, and finds working with you rewarding will forgive your training mistakes — and there will be mistakes.

Build the relationship by:
- Playing with your dog regularly, not just training
- Keeping training sessions fun and ending before the dog is tired or frustrated
- Reading your dog's body language and respecting what they're telling you
- Being the predictor of good things — your presence should reliably signal safety and reward

### Maintenance Training

Training is never "done." Behaviors that aren't practiced will fade — especially under real-world pressure. Maintenance training means:

- Practicing known behaviors in new environments regularly
- Doing brief "tune-up" sessions when you notice a behavior degrading
- Keeping recalls sharp with surprise jackpot rewards even when you don't "need" them
- Continuing to add new behaviors throughout the dog's life — mental stimulation matters

### You've Come a Long Way

If you've worked through all four courses, you have a solid understanding of how dogs learn, how to communicate clearly, how to train foundational and advanced skills, and how to apply all of it in the real world. The most important thing now is consistency — show up, keep it positive, and enjoy your dog.`,
        key_takeaway: 'True reliability comes from a confident, emotionally resilient dog who has a strong relationship with their owner. Maintenance training throughout the dog\'s life keeps skills sharp and the bond strong.',
        order_index: 3,
        reading_time_minutes: 10,
      },
    ];

    for (const lesson of course4Lessons) {
      const res = await client.query(`
        INSERT INTO lessons (course_id, title, content, key_takeaway, order_index, reading_time_minutes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (course_id, title) DO UPDATE SET
          content = EXCLUDED.content,
          key_takeaway = EXCLUDED.key_takeaway,
          order_index = EXCLUDED.order_index,
          reading_time_minutes = EXCLUDED.reading_time_minutes
        RETURNING id
      `, [c4, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);
      await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
        ON CONFLICT (lesson_id) DO UPDATE SET title = EXCLUDED.title
      `, [res.rows[0].id, `Quiz: ${lesson.title}`]);
    }

    const c4QuizResults = await client.query(`
      SELECT q.id FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE l.course_id = $1 ORDER BY l.order_index
    `, [c4]);

    const c4Questions = [
      [
        { question: "A dog who sits perfectly at home but ignores 'sit' at the park is experiencing:", options: ["Stubbornness", "Context-specific learning / failure to generalize", "Dominance", "Forgetfulness"], correct: 1, explanation: "Dogs are context-specific learners. A behavior learned in one environment doesn't automatically transfer to others — it must be deliberately practiced in each new context." },
        { question: "When introducing a behavior in a new environment, you should:", options: ["Keep criteria the same as at home", "Temporarily lower criteria and use higher-value rewards", "Use corrections to enforce the known behavior", "Practice longer sessions to overcome the distraction"], correct: 1, explanation: "In new environments, temporarily lower your criteria — ask for easier behaviors — and use higher-value rewards to compete with the increased distraction level." },
        { question: "The correct order for adding the 3 D's when proofing a behavior is:", options: ["Add all three simultaneously for efficiency", "Distraction → Distance → Duration", "Add one D at a time, never more", "Duration → Distance → Distraction, always in that order"], correct: 2, explanation: "Add only one variable at a time — never distance and distraction together. This lets you know exactly what is causing any breakdown and set the dog up for success." },
      ],
      [
        { question: "In a multi-dog household, dogs should be fed:", options: ["Together so they learn to share", "Separately to prevent food guarding and conflict", "In a hierarchy with the dominant dog first", "On a random schedule to reduce resource guarding"], correct: 1, explanation: "Feeding dogs separately removes the primary trigger for food-related conflict. Dogs don't naturally share resources — management prevents problems from developing." },
        { question: "Before training dogs together as a group, each dog should:", options: ["Know at least 10 commands", "Be reliable with each behavior individually (about 90% success rate)", "Have lived together for at least 6 months", "Be the same age and breed"], correct: 1, explanation: "Each dog must first learn behaviors independently before group training. Otherwise, one dog will cue the other and you won't know if each truly understands the behavior." },
        { question: "When introducing a new dog to the household, the best first meeting location is:", options: ["At home so the existing dog feels comfortable", "Neutral ground, on leash, walking in parallel", "A dog park where they can run freely together", "Separate rooms at first, never meeting for weeks"], correct: 1, explanation: "Neutral ground prevents the existing dog from feeling territorial. Walking in parallel allows them to acclimate to each other's presence without the pressure of a face-to-face greeting." },
      ],
      [
        { question: "A dog who is 'over threshold' is:", options: ["Very relaxed and easy to train", "Too aroused or anxious to respond to training", "Extremely food motivated", "Fully generalized in their training"], correct: 1, explanation: "Over threshold means the dog's arousal or anxiety level has exceeded their ability to think and respond — instinct takes over. Training at this point is ineffective and potentially counterproductive." },
        { question: "The 'Look at That' (LAT) technique works by:", options: ["Teaching dogs to ignore distractions completely", "Rewarding the dog for noticing a distraction, changing their emotional response to it", "Punishing the dog for looking at triggers", "Using the distraction as a reward"], correct: 1, explanation: "LAT marks and rewards the dog FOR noticing the distraction, which changes the emotional association. The distraction becomes a cue to look at you for a reward rather than something to react to." },
        { question: "The best way to start distraction training is:", options: ["At the highest distraction level to build resilience quickly", "At a low-level distraction and work up systematically", "Only after the dog has been trained for 2+ years", "In the same environment where you normally train"], correct: 1, explanation: "Always start at a distraction level the dog can handle — well below threshold — and work up systematically. Jumping to high-level distractions before the dog is ready sets them up to fail." },
      ],
      [
        { question: "The difference between an 'obedient' dog and a 'confident' dog is:", options: ["Obedient dogs know more commands", "Confident dogs are emotionally resilient and reliable under pressure; obedient dogs may know commands but fall apart in challenging situations", "There is no difference", "Confident dogs don't need commands"], correct: 1, explanation: "Obedience training teaches commands. Confidence training builds the emotional resilience that makes those commands reliable in any situation. Both are needed for a truly well-trained dog." },
        { question: "Why is the human-dog relationship described as 'the foundation' of training?", options: ["Because dogs will only work for owners they love", "Because a dog who trusts you and enjoys working with you will be more forgiving of training mistakes and more motivated to engage", "Because dominant owners get better results", "It isn't — technique is more important than relationship"], correct: 1, explanation: "A strong relationship means the dog is intrinsically motivated to work with you, recovers faster from confusing training moments, and finds your presence itself rewarding — all of which accelerate learning." },
        { question: "Maintenance training means:", options: ["Repeating the same training program from the beginning annually", "Continuing to practice known behaviors in new contexts throughout the dog's life", "Only training when the dog shows regression", "Training for 30 minutes every day without fail"], correct: 1, explanation: "Behaviors that aren't practiced fade, especially under real-world pressure. Regular maintenance — brief tune-up sessions, surprise recall rewards, new environments — keeps skills sharp and the dog engaged." },
      ],
    ];

    for (let i = 0; i < c4QuizResults.rows.length && i < c4Questions.length; i++) {
      const quizId = c4QuizResults.rows[i].id;
      for (let j = 0; j < c4Questions[i].length; j++) {
        const q = c4Questions[i][j];
        await client.query(`
          INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (quiz_id, order_index) DO UPDATE SET
            question = EXCLUDED.question,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            explanation = EXCLUDED.explanation
        `, [quizId, q.question, JSON.stringify(q.options), q.correct, q.explanation, j]);
      }
    }
    console.log('✅ Course 4 seeded');

    // ─── Scenarios ────────────────────────────────────────────────────────────
    const scenarios = [
      { name: 'Mealtime', description: 'Keep your dog calm and mannerly while you eat', icon: '🍽️', color: 'orange', category: 'daily', order_index: 1 },
      { name: 'Feeding Time', description: 'Build good food manners and impulse control at meal preparation', icon: '🥣', color: 'yellow', category: 'daily', order_index: 2 },
      { name: 'Walk Time', description: 'Enjoy calm, loose-leash walks in any environment', icon: '🦮', color: 'green', category: 'exercise', order_index: 3 },
      { name: 'Grooming', description: 'Make grooming sessions positive and stress-free', icon: '✂️', color: 'pink', category: 'care', order_index: 4 },
      { name: 'Bedtime', description: 'Establish calm bedtime routines and good sleep habits', icon: '🌙', color: 'blue', category: 'daily', order_index: 5 },
      { name: 'Guests Arriving', description: 'Teach your dog to greet visitors politely', icon: '👋', color: 'purple', category: 'social', order_index: 6 },
      { name: 'Playtime', description: 'Safe, structured, and enriching play sessions', icon: '🎾', color: 'red', category: 'exercise', order_index: 7 },
      { name: 'Dog Park', description: 'Navigate dog-to-dog interactions safely and positively', icon: '🐾', color: 'teal', category: 'social', order_index: 8 },
      { name: 'Car Rides', description: 'Calm and safe travel with your dog', icon: '🚗', color: 'indigo', category: 'travel', order_index: 9 },
      { name: 'Vet Visit', description: 'Reduce anxiety and stress at veterinary appointments', icon: '🏥', color: 'cyan', category: 'care', order_index: 10 },
    ];

    const scenarioIds = {};
    // Load any already-existing scenarios so we don't duplicate them
    const existingScenarioRows = await client.query('SELECT id, name FROM scenarios');
    for (const row of existingScenarioRows.rows) {
      scenarioIds[row.name] = row.id;
    }
    // Only insert scenarios that don't exist yet
    for (const s of scenarios) {
      if (!scenarioIds[s.name]) {
        const res = await client.query(`
          INSERT INTO scenarios (name, description, icon, color, category, order_index)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `, [s.name, s.description, s.icon, s.color, s.category, s.order_index]);
        scenarioIds[s.name] = res.rows[0].id;
      }
    }

    // Scenario tips
    const scenarioTipsData = {
      'Mealtime': [
        { title: 'Teach "Place"', text: 'Train your dog to go to a designated spot (mat or bed) during meals. Start with short durations and gradually increase. Reward them for staying while you eat.', type: 'do' },
        { title: 'Never feed from the table', text: 'Feeding your dog from the table — even once — teaches them that begging works. Every "just this once" sets the behavior back significantly.', type: 'dont' },
        { title: 'Preemptive management', text: 'Before you sit down to eat, give your dog a food-stuffed Kong or chew. They\'ll be too busy with their own food to bother you about yours.', type: 'do' },
        { title: 'Reward the absence of begging', text: 'If your dog is lying quietly while you eat, toss them a small reward. You\'re reinforcing the behavior you want — relaxing while you eat.', type: 'reward' },
        { title: 'Why dogs beg', text: 'Begging evolved because it worked — humans fed dogs scraps for millennia. It\'s natural behavior that we accidentally reinforce with "cute" table scraps. Once you stop the reinforcement, begging will fade.', type: 'why' },
      ],
      'Feeding Time': [
        { title: 'Ask for a sit before every meal', text: 'Before placing the bowl down, ask for a sit. Only put the bowl down when your dog is sitting. This builds impulse control and a positive ritual around meals.', type: 'do' },
        { title: 'Practice "Wait" at the bowl', text: 'Ask your dog to wait as you lower the bowl. If they lunge forward, pick it back up and try again. Release with "Okay!" to eat. This prevents food guarding and builds self-control.', type: 'do' },
        { title: 'Never punish resource guarding', text: 'If your dog growls over their food bowl, don\'t punish it. This removes the warning and can cause biting. Instead, work with a trainer on counter-conditioning around the food bowl.', type: 'dont' },
        { title: 'Hand-feed occasionally', text: 'Periodically hand-feed your dog their kibble. This builds positive associations with hands near food and strengthens your bond.', type: 'do' },
        { title: 'Why meal manners matter', text: 'Dogs who practice impulse control at mealtimes develop better self-regulation throughout their lives. A dog who can wait for their food can also wait before rushing through the door or jumping on guests.', type: 'why' },
      ],
      'Walk Time': [
        { title: 'Stop when the leash tightens', text: 'The instant the leash tightens, stop walking. Wait for your dog to create slack and look back at you. Then reward and continue. Consistency is everything.', type: 'do' },
        { title: 'Allow sniff breaks', text: 'Sniffing is mentally enriching for dogs — 5 minutes of sniffing can be as tiring as 30 minutes of running. Allow your dog to sniff on a long leash at designated "sniff zones."', type: 'do' },
        { title: 'Don\'t reel in the leash constantly', text: 'Constantly shortening the leash teaches your dog to pull harder to get distance. Instead, stop completely and wait for them to return to you.', type: 'dont' },
        { title: 'Practice "look at me" on walks', text: 'Teach your dog to make eye contact with you on cue ("Watch me" or "Look"). Use this when approaching distractions to redirect attention before pulling begins.', type: 'do' },
        { title: 'Why leash walking is hard', text: 'Dogs naturally move faster than humans and are motivated to explore their environment. Loose-leash walking requires them to suppress natural drives — which is effortful. Reward it generously.', type: 'why' },
      ],
      'Grooming': [
        { title: 'Counter-condition grooming tools', text: 'Before using a brush, let your dog sniff it, then give a treat. Touch their shoulder with it, treat. Brush once, treat. Build up slowly so the tools predict good things.', type: 'do' },
        { title: 'Keep sessions very short at first', text: 'A 2-minute positive grooming session is worth more than a 10-minute struggle. End before your dog gets anxious. Gradually extend as they become comfortable.', type: 'do' },
        { title: 'Don\'t restrain a panicking dog', text: 'If your dog is clearly distressed during grooming (whale eye, trying to escape, trembling), don\'t force it. Take a step back in your desensitization protocol.', type: 'dont' },
        { title: 'The "nail trim" approach', text: 'Teach your dog to voluntarily present their paw on cue ("Paw"). Start by clicking for them touching a scratch board. Make nail care a game, not a battle.', type: 'do' },
        { title: 'Why grooming is stressful for some dogs', text: 'Many dogs haven\'t been properly desensitized to handling. Restraint, unfamiliar sensations, and unexpected movements are all potential triggers. Positive conditioning creates a calm, cooperative grooming partner.', type: 'why' },
      ],
      'Bedtime': [
        { title: 'Create a consistent bedtime routine', text: 'Dogs thrive on routine. A predictable sequence (last potty trip, quiet time, settle on bed) signals to your dog that it\'s time to wind down. Consistency speeds up the process.', type: 'do' },
        { title: 'Teach a "settle" cue', text: 'Train your dog to lie on their mat or bed on cue. Start by luring them onto the mat, marking calm behavior, and rewarding. Gradually fade the lure.', type: 'do' },
        { title: 'Avoid exciting play right before bed', text: 'High-energy play before bedtime revs up your dog\'s arousal system and makes it harder for them to settle. Schedule vigorous exercise earlier in the evening.', type: 'dont' },
        { title: 'Use a stuffed Kong for crate time', text: 'If your dog sleeps in a crate, make it wonderful by providing a frozen, food-stuffed Kong at bedtime. The crate predicts something great, not isolation.', type: 'do' },
        { title: 'Why some dogs struggle with sleep', text: 'Dogs who don\'t get enough physical and mental stimulation during the day often struggle to settle at night. A tired dog is a calm dog. Ensure your dog has had adequate exercise and enrichment before expecting them to rest.', type: 'why' },
      ],
      'Guests Arriving': [
        { title: 'Practice before guests arrive', text: 'Train your dog to sit or go to their mat when the doorbell rings — not just when guests are already present. Use recordings of doorbells and knock sounds to practice without real visitors.', type: 'do' },
        { title: 'Set the dog up for success', text: 'Before guests arrive, exercise your dog. A tired dog is a calmer dog. If needed, put them in another room for the initial chaotic arrival, then bring them in calmly.', type: 'do' },
        { title: 'Don\'t punish excited greetings in the moment', text: 'In the middle of the excitement, punishment increases arousal. Instead, use management (leash, gate) and train the alternative behavior (sit-to-greet) in calm practice sessions.', type: 'dont' },
        { title: 'Ask guests to help train', text: 'Give guests treats and ask them to reward the dog ONLY when all four paws are on the floor. Every guest who enforces your rule is one more training session.', type: 'do' },
        { title: 'Why dogs jump on guests', text: 'Jumping is a natural greeting behavior — dogs jump up to get closer to human faces. It\'s how puppies greet adult dogs. The behavior is reinforced by the attention it gets, even when that attention is being pushed away.', type: 'why' },
      ],
      'Playtime': [
        { title: 'Use toys, not hands', text: 'Never use your hands as toys during play. This teaches bite inhibition and prevents the dog from learning that human body parts are appropriate play objects. Always use a toy as the "target" for biting.', type: 'do' },
        { title: 'Teach "drop it" and "leave it"', text: 'These two cues are essential for safe play. "Drop it" means release what\'s in your mouth. "Leave it" means don\'t touch that. Practice these outside of play, then use them during games.', type: 'do' },
        { title: 'End play before the dog gets over-aroused', text: 'When play escalates to biting too hard, zoomies, or loss of control, end the session by becoming boring. Wait for calm, then resume. Teach your dog that calm behavior keeps the game going.', type: 'dont' },
        { title: 'Tug-of-war is great exercise', text: 'Tug is a fantastic, tiring game that most dogs love. It does NOT create aggression. Rules: the dog must drop on cue, and you start and stop the game. This actually teaches impulse control.', type: 'do' },
        { title: 'Why play matters', text: 'Play is not just fun — it\'s essential for mental and physical well-being, bonding, and stress relief. Dogs who play regularly with their owners have stronger relationships and show fewer behavior problems.', type: 'why' },
      ],
      'Dog Park': [
        { title: 'Know your dog\'s signals', text: 'Learn to read play vs. stress signals. Play: loose wiggly body, play bow, reciprocal chase. Stress: stiff body, hard stare, tucked tail, whale eye. Leave if you see stress signals in your or other dogs.', type: 'do' },
        { title: 'Avoid the "run in and greet" mistake', text: 'Dogs who rush directly at each other face-to-face are at higher risk of conflict. Good dog greetings are curved, sniffing the side and rear. Practice calm parallel walking before direct greetings.', type: 'do' },
        { title: 'Don\'t leave your dog unsupervised', text: 'Dog parks require constant supervision. Group play can escalate quickly. Your job is to monitor body language and intervene before situations escalate, not to chat with other owners.', type: 'dont' },
        { title: 'Practice recalls at the park', text: 'Call your dog to you periodically during park time. Give a treat, then release them to play again. This keeps your recall sharp and teaches your dog that "Come" doesn\'t mean fun ends.', type: 'do' },
        { title: 'Why dog parks can be tricky', text: 'Dog parks mix unfamiliar dogs of different ages, sizes, and social styles in an off-leash environment — which is actually unusual in dog social history. Not all dogs enjoy this setting. Know your dog.', type: 'why' },
      ],
    };

    for (const [scenarioName, tips] of Object.entries(scenarioTipsData)) {
      const scenarioId = scenarioIds[scenarioName];
      if (!scenarioId) continue;
      // Only insert tips if none exist yet for this scenario
      const existingTips = await client.query(
        'SELECT COUNT(*) FROM scenario_tips WHERE scenario_id = $1', [scenarioId]
      );
      if (parseInt(existingTips.rows[0].count) === 0) {
        for (let i = 0; i < tips.length; i++) {
          const tip = tips[i];
          await client.query(`
            INSERT INTO scenario_tips (scenario_id, tip_title, tip_text, tip_type, order_index)
            VALUES ($1, $2, $3, $4, $5)
          `, [scenarioId, tip.title, tip.text, tip.type, i]);
        }
      }
    }
    console.log('✅ Scenarios seeded');

    // ─── Scenario Guides (book-sourced training guides) ───────────────────────
    const scenarioGuides = {
      'Mealtime': `• Before sitting down to eat, give your dog something to do — a stuffed Kong, a chew, or a long-lasting treat on their mat. A busy dog doesn't beg.\n• Teach a "Go to your place" cue: lure your dog to a designated mat or bed, reward for going there, and gradually build duration until they can hold it through your whole meal.\n• Start small — practice having your dog on their mat for just 30 seconds while you sit at the table. Reward calm behavior by tossing a treat their way without making eye contact.\n• If your dog approaches the table, calmly stand, take them back to their mat, and reward for staying. No anger, no drama — just reset and try again.\n• Be completely consistent: one person feeding from the table undoes weeks of training for the whole family. Everyone must follow the same rules.\n• A tired dog is a well-behaved dog — schedule vigorous exercise or a long walk before mealtimes to reduce begging drive.\n• Once your dog is reliably staying on their mat, you can occasionally reward them from a distance (tossing a treat) to reinforce that good things come when they stay back.\n• If begging is deeply entrenched, manage with a baby gate or closed door at mealtimes while you work on the "place" behavior in separate training sessions.`,

      'Feeding Time': `• Before every meal, ask your dog to sit. Only place the bowl down when all four paws are still and your dog is focusing calmly. This simple ritual builds impulse control daily.\n• Teach the "Wait" cue at the bowl: say "Wait," begin lowering the bowl, and if your dog lunges, immediately pick it back up. When they hold the sit, lower and release with "Okay!" Dogs learn quickly that patience is what makes dinner appear.\n• To prevent resource guarding, do the 4-week food bowl program: Week 1, feed your dog entirely by hand, kibble by kibble. Week 2, place the bowl and approach while they eat, dropping in extra kibble each time. Week 3, approach and add something special like a piece of chicken. Week 4, pick up the bowl briefly, drop something delicious on the floor, then return the bowl with even better food in it. The lesson: human hands near the bowl means something great is coming.\n• Have all family members participate in feeding. The dog should see every person as a source of good things, not a threat to their food.\n• Feed at consistent times each day. Predictable feeding schedules reduce anxiety and food obsession by removing uncertainty about when the next meal comes.\n• Avoid leaving food out all day (free feeding). Scheduled meals make training easier, keep you aware of your dog's appetite, and give you a natural daily training opportunity.\n• Never punish a dog who growls over their food bowl — growling is communication. Address resource guarding through positive counter-conditioning, not confrontation.`,

      'Walk Time': `• Before putting on the leash, require calm behavior. If your dog is bouncing off the walls, set the leash down and wait. Pick it up only when they're sitting or standing still. The leash only goes on when they're calm.\n• The golden rule of loose-leash walking: the moment the leash tightens, stop moving. You are not a sled dog — forward movement is the reward. Stand still and wait for your dog to relieve pressure and look back at you, then click or say "Yes!" and continue.\n• Click and treat frequently when the leash is loose, not just when your dog is right at your side. Catching and rewarding the loose leash — wherever your dog is — teaches them that keeping slack in the line pays off.\n• Change directions frequently and unpredictably to keep your dog focused on you. When your dog gets ahead, quietly turn and go the other way. No jerking — just a change in direction that makes them hustle to catch up.\n• Allow and schedule sniff breaks. Sniffing is deeply satisfying and mentally tiring for dogs. Use a cue like "Go Sniff!" to release your dog to explore, then resume the walk with "Let's Go."\n• If your dog is too excited or distracted to respond to food, increase distance from the distraction first. Move far enough away that your dog can think again, then reward focus before getting closer.\n• For dogs who pull very hard, consider a front-clip no-pull harness. The front clip redirects the dog sideways when they pull forward, reducing the pulling force without causing pain. Always use with positive training.\n• Practice loose-leash walking in low-distraction environments first — inside the house, in your backyard, then a quiet street — before attempting busy parks or sidewalks.`,

      'Grooming': `• Before any grooming session, pair every tool with treats: let your dog sniff the brush, give a treat. Touch them with it, give a treat. Do one brush stroke, give a treat. Build the association that grooming equipment predicts good things.\n• Keep early sessions extremely short — 2 to 3 minutes maximum. End while your dog is still relaxed and happy. A short positive session is far more valuable than a long stressful one.\n• Work in small increments: Day 1, touch the brush to your dog's shoulder once. Day 2, two brush strokes. Progress at your dog's pace, not yours. Never push through visible stress (whale eye, turning away, freezing, panting).\n• Use a lick mat smeared with peanut butter, cream cheese, or wet food during grooming sessions. Having something to lick keeps dogs calm, focused, and creates a strong positive association.\n• Practice handling paws, ears, and mouth daily — especially with puppies. Pick up each paw briefly and give a treat. Touch inside the ear flap and treat. Gently hold the muzzle and treat. This "cooperative care" training pays dividends at every grooming and vet visit.\n• For nail trims, start by clicking and treating just for touching the nail with your clippers. Then for a gentle squeeze (no cutting), then one tiny sliver at a time. Using a scratch board (a piece of sandpaper on the floor) also lets dogs file their own front nails in a positive, dog-powered way.\n• Never chase, corner, or forcibly restrain a dog to complete grooming. This destroys trust. Take a step back in your desensitization process and rebuild confidence from where your dog feels safe.\n• Always end grooming sessions with your dog's favorite reward — a play session, a walk, or a special treat — so the whole experience ends on the best possible note.`,

      'Bedtime': `• Establish a consistent nighttime routine and stick to it. A predictable sequence — last potty trip outside, quiet wind-down time, settling on their bed — teaches your dog what's coming and speeds up the transition to calm.\n• Give your dog vigorous exercise and mental stimulation in the hours before bedtime. A dog who has been adequately tired out physically and mentally will settle far more easily than one who hasn't.\n• Teach the "Settle" cue in short sessions away from bedtime: lure your dog onto their designated mat or bed, reward them for lying down, and gradually build duration by rewarding calm, relaxed behavior. Add the cue ("Settle," "Bed," "Place") once they reliably go to their spot.\n• If your dog sleeps in a crate, make the crate genuinely wonderful. Feed meals inside it. Place their most comfortable bedding in it. Offer a frozen, food-stuffed Kong at crate time — this gives them something satisfying to do and creates a strong positive association with going in.\n• Never use the crate as punishment. If the crate is only used for unpleasant confinement, your dog will resist it. The crate should be their favorite resting den, not a jail.\n• For dogs who cry or bark in their crate at night, don't let them out in response to noise — this reinforces the behavior. Wait for even a brief moment of quiet, then reward. Gradually extend the quiet period required before release.\n• A white noise machine, calming music, or a heartbeat toy (for puppies) can help sensitive dogs relax and drown out startling nighttime sounds.\n• If your dog wakes you at night, keep the interaction very boring — a quick, quiet potty break with no play or conversation. A dull response discourages unnecessary wake-ups.`,

      'Guests Arriving': `• Train the behavior before guests arrive, not during the chaos. Use recorded doorbell sounds and practice having your dog sit, then reward. Pair the sound of the doorbell with going to a designated greeting mat near the door.\n• Exercise your dog before guests arrive. A dog who has been on a long walk or had a vigorous play session is much calmer and easier to manage when company shows up.\n• Use management tools while training is in progress: a leash, a baby gate, or a tether near the door. This prevents your dog from rehearsing jumping on guests, which only makes the behavior stronger.\n• Ask guests to completely ignore your dog until all four paws are on the floor — no eye contact, no talking, no touching while the dog is jumping. Even pushing the dog away counts as attention and reinforces the behavior.\n• Give arriving guests a handful of treats and instructions: "Ask for a sit, then reward." Every guest who follows your protocol is an additional training session. Every guest who lets your dog jump undoes your work.\n• Practice "staged arrivals" with a friend: have them knock, leave, come back, knock again. The more repetitions of the doorbell-then-calm routine, the faster your dog learns that arrivals are no big deal.\n• Teach your dog that the doorbell is a cue to go to their mat and wait for a release. This incompatible behavior — lying on a mat — makes it physically impossible to simultaneously jump on guests.\n• Once the initial excitement passes, supervised interaction on a loose leash lets you reward your dog for polite greetings and step back in if they start to get overly excited.`,

      'Playtime': `• Always use a toy as the target for play, never your hands or feet. Allowing a dog to grab or mouth human body parts — even gently — teaches them that bodies are appropriate play objects, which creates problems as the dog grows larger.\n• Teach "Drop It" before you need it: offer a toy, let the dog grab it, present a high-value treat near their nose, and the moment they release, say "Drop it!" and reward. Practice this outside of exciting play sessions first.\n• Tug-of-war is excellent exercise and a great bonding activity — it does NOT create aggression when played with clear rules. The rules: you start and stop the game, the dog must drop on cue, and if teeth touch skin, the game immediately pauses. Consistent rules build impulse control.\n• Keep play sessions shorter than you think they should be. Stopping the game while your dog still wants more keeps enthusiasm high for next time. Play until boredom or over-arousal, and sessions end on a sour note.\n• Watch for escalating arousal: hard biting, inability to respond to cues, frantic movement, snapping. When you see these signs, calmly end the session by becoming boring — stand still, cross your arms, turn away. Resume when your dog has settled.\n• Use play as a reward for training. Work on a few behaviors, then explode into a play session as the jackpot. This makes training thrilling and play meaningful.\n• Rotate toys to keep them novel and exciting. A toy your dog hasn't seen for two weeks is as exciting as a brand-new toy.\n• For fetch, teach the "retrieve" chain backward: first shape your dog to bring the item back and release it, then build the chase and catch. A dog who doesn't return the toy is playing keep-away, not fetch.`,

      'Dog Park': `• Before visiting an off-leash dog park, ensure your dog has a reliable recall in low-distraction environments. A solid "Come!" is a safety necessity. Practice recalls regularly — call your dog, give a high-value treat, then release them back to play.\n• Observe the park before entering. Watch through the fence for a minute: Are the dogs playing loosely and reciprocally? Are there any stiff, over-intense interactions? If the energy looks chaotic or one dog is being bullied, wait or choose another time.\n• Remove your dog's leash inside the double-gated entry before letting them through. A leashed dog surrounded by off-leash dogs is a setup for frustration and conflict — the leash creates a disadvantage in canine body language.\n• Keep your attention on your dog at all times. Monitor their body language and be ready to intervene before situations escalate. This is not the time to look at your phone or chat at length with other owners.\n• Practice recalls periodically during the visit: call your dog over, give a high-value treat, then release them with "Go play!" This prevents the recall from signaling that fun is over, and keeps the behavior sharp.\n• Know the difference between play and bullying. Normal play: loose, bouncy bodies; play bows; taking turns chasing. Bullying: persistent chasing with no breaks, one dog trying to escape repeatedly, stiff bodies and hard stares.\n• Not all dogs enjoy dog parks, and that's okay. Some dogs prefer small playgroups with known dogs, or one-on-one play dates. Forcing an anxious dog into a busy park does not build confidence — it builds anxiety.\n• Ensure your dog is fully vaccinated, flea and tick preventatives are current, and they are spayed or neutered before regular park visits to minimize health risks and social friction.`,

      'Car Rides': `• Build positive car associations before asking your dog to go anywhere. Start by rewarding your dog for approaching the car willingly. Next, reward for getting in (car parked and off). Then start the engine, give treats, turn it off. Gradually build from there.\n• Take very short "positive destination" trips to start: drive to the end of the block and back. Drive to the dog park. Drive to get a puppuccino. Make the car predict excellent things so often that your dog is eager to hop in.\n• Use a crate or a certified dog car harness for safety. Both protect your dog physically in an accident and reduce anxiety by limiting their ability to pace and whine. A covered crate feels especially den-like and calming.\n• For dogs who are anxious in cars, cover the crate with a blanket to reduce visual stimulation. Many dogs who are distressed by moving scenery calm down significantly when they can't see it.\n• Never leave your dog in a parked car in warm weather. A car with windows cracked in 70-degree weather can reach deadly temperatures within minutes. This is a non-negotiable safety rule.\n• If your dog gets carsick, keep the car well ventilated, limit food for two hours before traveling, drive smoothly (minimize sudden stops and sharp turns), and talk to your vet about motion-sickness medications.\n• On longer trips, stop every one to two hours for a brief walk and potty break. Physical movement helps dissipate anxiety and prevents stiffness.\n• If your dog is severely car-anxious, talk to your veterinarian. Short-term anti-anxiety medications or supplements can reduce the emotional intensity during desensitization, making the process faster and more humane.`,

      'Vet Visit': `• Schedule "happy visits" to the vet clinic regularly — walk in, have the staff give your dog treats, and leave without any examination. This teaches your dog that the vet's office predicts good things rather than scary procedures.\n• Practice handling at home that mimics what happens at the vet: lift each paw and press on the pads, look in both ears, gently open the mouth, feel along the belly and ribs. Click and treat generously for tolerance and cooperation.\n• Bring your dog's highest-value treats to every vet appointment — something they don't get at any other time. Ask the vet and tech to offer treats throughout the exam. Food actively creates new positive associations with the experience.\n• Stay calm yourself. Dogs are exquisitely sensitive to your emotional state. If you are anxious about the visit, your dog feels it and becomes more anxious themselves. Take a breath, speak in a relaxed tone, and project confidence.\n• Ask your veterinary practice about "fear-free" or "low-stress handling" techniques. Many modern practices use calming pheromones, non-slip mats, and minimize restraint. These approaches make a significant difference for anxious dogs.\n• If your dog is highly anxious at the vet, talk to your vet about pre-visit medications. Gabapentin given the night before and morning of an appointment can dramatically reduce anxiety without over-sedating, making the visit tolerable for everyone.\n• Request that your dog be examined on the floor rather than the exam table if they are more comfortable there. A relaxed dog on the floor is safer and easier to examine than a panicking dog on a table.\n• Maintain regular wellness visits even when nothing is wrong. The more often your dog visits the clinic for positive experiences, the less the "vet office" becomes associated exclusively with scary procedures.`,
    };

    // Update guide content for each scenario (always update so deploys refresh content)
    for (const [scenarioName, guideText] of Object.entries(scenarioGuides)) {
      const scenarioId = scenarioIds[scenarioName];
      if (!scenarioId) continue;
      await client.query(
        'UPDATE scenarios SET guide = $1 WHERE id = $2',
        [guideText, scenarioId]
      );
    }
    console.log('✅ Scenario guides updated');

    await client.query('COMMIT');
    console.log('\n🎉 All seed data inserted successfully!');
    console.log('Admin login: Mikemelazzo@me.com / PositivePaws2024!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
