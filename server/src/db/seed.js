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
      VALUES ('Mike', 'Mikemelazzo@me.com', $1, 'admin', 'Positive Paws founder and head trainer.')
      ON CONFLICT (email) DO NOTHING
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
        ON CONFLICT DO NOTHING RETURNING id
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
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [c1, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);

      // Create quiz for each lesson
      const quizRes = await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70) RETURNING id
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
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [c2, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);
      await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
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
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [c3, lesson.title, lesson.content, lesson.key_takeaway, lesson.order_index, lesson.reading_time_minutes]);
      await client.query(`
        INSERT INTO quizzes (lesson_id, title, passing_score) VALUES ($1, $2, 70)
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
        `, [quizId, q.question, JSON.stringify(q.options), q.correct, q.explanation, j]);
      }
    }
    console.log('✅ Course 3 seeded');

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
    for (const s of scenarios) {
      const res = await client.query(`
        INSERT INTO scenarios (name, description, icon, color, category, order_index)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [s.name, s.description, s.icon, s.color, s.category, s.order_index]);
      scenarioIds[s.name] = res.rows[0].id;
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
      for (let i = 0; i < tips.length; i++) {
        const tip = tips[i];
        await client.query(`
          INSERT INTO scenario_tips (scenario_id, tip_title, tip_text, tip_type, order_index)
          VALUES ($1, $2, $3, $4, $5)
        `, [scenarioId, tip.title, tip.text, tip.type, i]);
      }
    }
    console.log('✅ Scenarios seeded');

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
