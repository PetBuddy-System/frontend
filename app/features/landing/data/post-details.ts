import type { BlogPost } from '~/features/landing/data/posts'

export interface BlogPostDetail extends BlogPost {
  authorRole: string
  readTime: number
  markdownContent: string
  sections: {
    id: string
    title: string
  }[]
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Essential Supplies Every New Pet Owner Needs',
    excerpt:
      'Bringing a new pet home is exciting, but being prepared with the right supplies makes the transition smoother for both you and your furry friend.',
    category: 'featured',
    categoryLabel: 'Featured',
    author: 'PetBuddy Team',
    date: 'Jan 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'
  },
  {
    id: '2',
    title: 'Understanding Your Dog Body Language: A Complete Guide',
    excerpt:
      'Dogs communicate through body language, and learning to read their signals helps build a stronger bond.',
    category: 'training',
    categoryLabel: 'Training',
    author: 'Dr. Minh Tran',
    date: 'Jan 12, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80'
  },
  {
    id: '3',
    title: 'The Best Diet Plan for Puppies: Nutrition by Age',
    excerpt:
      'Puppies have different nutritional needs at every growth stage. Learn how to choose the right food.',
    category: 'nutrition',
    categoryLabel: 'Nutrition',
    author: 'Dr. Lan Nguyen',
    date: 'Jan 10, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80'
  },
  {
    id: '4',
    title: 'Grooming at Home vs. Professional Grooming: Pros & Cons',
    excerpt:
      'Should you groom your pet at home or visit a professional? We break down the costs and benefits.',
    category: 'grooming',
    categoryLabel: 'Grooming',
    author: 'PetBuddy Team',
    date: 'Jan 8, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&q=80'
  },
  {
    id: '5',
    title: 'Common Health Issues in Senior Cats and How to Manage Them',
    excerpt:
      'As cats age, they face unique health challenges. Knowing the signs helps you provide the best care.',
    category: 'health',
    categoryLabel: 'Health',
    author: 'Dr. Hoa Le',
    date: 'Jan 5, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80'
  },
  {
    id: '6',
    title: 'Fun Indoor Activities to Keep Your Pet Active',
    excerpt:
      'Rainy days and hot afternoons do not have to mean bored pets. These creative indoor games keep your pet stimulated.',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle',
    author: 'PetBuddy Team',
    date: 'Jan 3, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80'
  },
  {
    id: '7',
    title: 'How to Introduce a New Pet to Your Existing Pets',
    excerpt:
      'Introducing a new pet to your household takes patience and strategy. Follow our step-by-step guide.',
    category: 'training',
    categoryLabel: 'Training',
    author: 'Dr. Minh Tran',
    date: 'Dec 30, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80'
  },
  {
    id: '8',
    title: 'Seasonal Allergies in Dogs: Signs and Natural Remedies',
    excerpt:
      'Just like humans, dogs can suffer from seasonal allergies. Learn to identify symptoms and explore remedies.',
    category: 'health',
    categoryLabel: 'Health',
    author: 'Dr. Lan Nguyen',
    date: 'Dec 28, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&q=80'
  }
]

export const MOCK_POST_DETAILS: BlogPostDetail[] = [
  {
    ...MOCK_POSTS[0],
    authorRole: 'Pet Care Expert',
    readTime: 6,
    sections: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'essentials', title: 'The Essential Supplies' },
      { id: 'setup', title: 'Setting Up Your Home' },
      { id: 'conclusion', title: 'Summary' }
    ],
    markdownContent: `## Introduction

Bringing a new pet home is one of the most exciting moments in any pet parent's life. However, being prepared with the right supplies can make the transition smoother for both you and your furry friend.

According to pet care experts, setting up your home before your pet arrives reduces stress and helps them adjust faster to their new environment.

## The Essential Supplies

### Food and Water Bowls
Choose stainless steel or ceramic bowls that are easy to clean and resistant to bacteria. Avoid plastic bowls as they can harbor bacteria and cause skin reactions in some pets.

### Quality Pet Food
Consult your veterinarian about the best food for your pet's age, breed, and health needs. Puppies and kittens require different nutrition than adult pets.

### Comfortable Bed
A good quality pet bed provides the support your pet needs for proper rest. Consider the size of your pet and whether they prefer to curl up or stretch out.

### Collar, Leash, and ID Tag
Even if your pet will be indoor-only, an ID tag with your contact information is essential. A collar with a microchip tag provides permanent identification.

## Setting Up Your Home

### Create a Safe Space
Designate a quiet area where your pet can retreat when they feel overwhelmed. This could be a corner of a room with their bed and some toys.

### Pet-Proof Your Home
- Secure electrical cords
- Remove toxic plants
- Store medications and chemicals safely
- Keep small objects out of reach

### Establish a Routine
Pets thrive on routine. Set consistent feeding times, walk schedules, and playtimes from the beginning.

## Summary

Preparing for a new pet takes some effort, but being well-equipped ensures a smoother transition for everyone. Remember to consult your veterinarian for personalized advice based on your pet's specific needs.`
  },
  {
    ...MOCK_POSTS[1],
    authorRole: 'Veterinary Specialist',
    readTime: 8,
    sections: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'body-signals', title: 'Understanding Body Signals' },
      { id: 'tail-wagging', title: 'The Truth About Tail Wagging' },
      { id: 'conclusion', title: 'Building Better Communication' }
    ],
    markdownContent: `## Introduction

Dogs communicate primarily through body language. Learning to read their signals helps build a stronger bond and prevents misunderstandings that could lead to behavioral issues.

## Understanding Body Signals

### Ear Positions
- **Forward and alert**: Your dog is interested or curious
- **Pinned back**: Fear, anxiety, or submission
- **Relaxed to the side**: A calm, content dog

### Eye Contact
- **Soft eyes** (relaxed): Your dog is comfortable
- **Hard staring**: May indicate aggression or challenge
- **Whale eye** (showing whites): Stress or anxiety

### Mouth and Facial Expressions
- **Relaxed mouth, slightly open**: Content and at ease
- **Lip licking or yawning**: Signs of stress in calm context
- **Showing teeth**: Can mean aggression or fear — read the whole body

## The Truth About Tail Wagging

Not all tail wags mean the same thing. Research shows:

- **Slow wag with low tail**: Insecurity
- **Fast wag with high tail**: Excitement or arousal
- **Stiff, high wag with dilated pupils**: Potential aggression
- **Loose, broad wag**: Friendly and relaxed

Always read the entire body, not just the tail.

## Building Better Communication

Practice observing your dog in different situations. Pay attention to patterns in their behavior. The more you understand their language, the stronger your bond will become.

Consider keeping a journal of behaviors you notice. This helps identify triggers and preferences specific to your pet.`
  },
  {
    ...MOCK_POSTS[2],
    authorRole: 'Pet Nutritionist',
    readTime: 10,
    sections: [
      { id: 'introduction', title: 'Nutrition Fundamentals' },
      { id: 'stages', title: 'Nutrition by Life Stage' },
      { id: 'feeding', title: 'Feeding Guidelines' },
      { id: 'supplements', title: 'Supplements' }
    ],
    markdownContent: `## Nutrition Fundamentals

Proper nutrition is the foundation of your puppy's health. Puppies have different nutritional needs at every growth stage, and meeting these needs is essential for their physical and cognitive development.

## Nutrition by Life Stage

### 8 Weeks to 4 Months
During rapid growth, puppies need:
- High protein content (25-30%)
- Adequate fat for brain development
- Calcium and phosphorus for bone growth
- Frequent small meals (3-4 times daily)

### 4 to 6 Months
Continue with puppy food formulated for large or small breeds accordingly. This is when teething occurs — provide appropriate chew toys.

### 6 to 12 Months
Gradually transition to adult food based on your vet's recommendation. Small breeds may need to stay on puppy food longer than large breeds.

## Feeding Guidelines

| Puppy Age | Meals per Day |
|-----------|---------------|
| 8-12 weeks | 4 meals |
| 3-6 months | 3 meals |
| 6-12 months | 2 meals |

Always provide fresh water and measure portions according to your puppy's weight and activity level.

## Supplements

Most complete puppy foods provide adequate nutrition. However, some puppies may benefit from:

- Omega-3 fatty acids for brain development
- Probiotics for digestive health
- Joint supplements for large breed puppies

**Always consult your veterinarian before adding supplements to your puppy's diet.**`
  },
  {
    ...MOCK_POSTS[3],
    authorRole: 'Professional Groomer',
    readTime: 7,
    sections: [
      { id: 'home-grooming', title: 'Home Grooming Basics' },
      { id: 'professional', title: 'When to See a Professional' },
      { id: 'costs', title: 'Costs and Time Comparison' },
      { id: 'decision', title: 'Making the Right Choice' }
    ],
    markdownContent: `## Home Grooming Basics

Regular brushing is the foundation of pet grooming. It removes loose fur, distributes natural oils, and allows you to check for skin issues.

### Essential Home Tools
- Slicker brush for removing tangles
- Undercoat rake for double-coated breeds
- Nail clippers or grinder
- Dog-specific shampoo
- Ear cleaner
- Toothbrush and pet toothpaste

### Brushing Frequency by Coat Type
- **Short smooth**: Once weekly
- **Long/double coat**: Daily
- **Curly/wavy (Poodles, Bichon)**: Every 2-3 days

## When to See a Professional

Some situations call for professional expertise:

- ** breed-specific haircuts**: Poodles, Shih Tzus, Westies need regular professional styling
- **Mat removal**: Severely matted fur may require sedation
- **Nail trimming**: If nails are overgrown and curving
- **Anal gland expression**: Best done by experienced groomers

## Costs and Time Comparison

| Task | Home | Professional |
|------|------|-------------|
| Basic bath | 30-45 min / Free | $30-60 |
| Full groom | 2-3 hours | $60-150 |
| Nail trim | 10 min / Free | $10-20 |
| Breed clip | N/A | $80-200 |

## Making the Right Choice

Many pet parents find a hybrid approach works best: regular home maintenance between professional grooming sessions. This keeps pets comfortable, reduces stress, and can be more cost-effective.`
  },
  {
    ...MOCK_POSTS[4],
    authorRole: 'Feline Specialist',
    readTime: 9,
    sections: [
      { id: 'aging', title: 'Recognizing Aging' },
      { id: 'health-issues', title: 'Common Senior Cat Health Issues' },
      { id: 'management', title: 'Managing Health at Home' },
      { id: 'veterinary', title: 'Veterinary Care for Seniors' }
    ],
    markdownContent: `## Recognizing Aging

Cats are considered seniors at around 11 years of age. As they age, they face unique health challenges that require attention and proactive management.

Signs your cat may be entering their senior years:
- Decreased activity
- Difficulty jumping or climbing
- Changes in sleep patterns
- Increased vocalization
- Changes in grooming habits

## Common Senior Cat Health Issues

### Kidney Disease
One of the most common conditions in older cats. Symptoms include increased thirst and urination, weight loss, and poor appetite. Early detection through blood work is crucial.

### Hyperthyroidism
Causes weight loss despite increased appetite, hyperactivity, and increased thirst. Easily managed with medication or dietary changes.

### Arthritis
Many senior cats suffer in silence. Signs include reluctance to jump, stiffness after rest, and decreased grooming. ramps and orthopedic beds can help.

### Dental Disease
Up to 85% of cats over three years have dental issues. Regular dental checkups and at-home care are essential.

## Managing Health at Home

- Provide low-sided litter boxes
- Offer multiple water stations
- Maintain consistent feeding times
- Groom regularly as they may groom less
- Provide heated bedding options

## Veterinary Care for Seniors

Schedule veterinary checkups every 6 months for senior cats. Include blood work, urinalysis, and blood pressure monitoring as recommended by your vet.`
  },
  {
    ...MOCK_POSTS[5],
    authorRole: 'Pet Behaviorist',
    readTime: 5,
    sections: [
      { id: 'indoor', title: 'Why Indoor Activities Matter' },
      { id: 'games', title: 'Fun Games for Dogs' },
      { id: 'cats', title: 'Activities for Cats' },
      { id: 'safety', title: 'Safety Tips' }
    ],
    markdownContent: `## Why Indoor Activities Matter

Rainy days and hot afternoons don't have to mean bored pets. Indoor activities provide mental stimulation, prevent destructive behaviors, and strengthen the bond between you and your pet.

## Fun Games for Dogs

### Hide and Seek
1. Have your dog stay
2. Hide somewhere in the house
3. Call their name
4. Celebrate when they find you!
5. Eventually hide treats or toys

### Puzzle Feeders
Food puzzles provide mental stimulation and slow down fast eaters. Start with easy puzzles and increase difficulty.

### Indoor Fetch
Clear a safe space and play fetch in the hallway. Use soft toys to prevent damage and injury.

### Training Sessions
Indoor training sessions reinforce commands and burn mental energy. Work on new tricks or practice existing ones.

## Activities for Cats

### Feather Wand Play
Interactive wand toys simulate hunting behavior. Let your cat "catch" the toy periodically to prevent frustration.

### Cardboard Castles
Create tunnels and hiding spots from cardboard boxes. Cats love exploring enclosed spaces.

### Window Entertainment
Set up a bird feeder outside a window or hang a bird feeder mobile inside. Ensure screens are secure.

## Safety Tips

- Remove fragile items from play areas
- Secure electrical cords
- Store small objects that could be swallowed
- Ensure adequate ventilation
- Keep toxic plants out of reach`
  },
  {
    ...MOCK_POSTS[6],
    authorRole: 'Animal Behaviorist',
    readTime: 8,
    sections: [
      { id: 'preparation', title: 'Preparation Before Introduction' },
      { id: 'stages', title: 'Step-by-Step Introduction' },
      { id: 'signs', title: 'Reading the Signs' },
      { id: 'troubleshooting', title: 'Common Problems' }
    ],
    markdownContent: `## Preparation Before Introduction

Introducing a new pet to your household takes patience and strategy. Rushing the process can lead to long-term behavioral problems and stress for all involved.

### Before Bringing Home
- Set up a separate space for the new pet
- Exchange scents by swapping blankets
- Establish routines for existing pets
- Plan for at least 2 weeks of supervised introductions

### What You'll Need
- Baby gates or crate for separation
- Separate food and water bowls
- Multiple litter boxes (for cats)
- Individual toys and bedding
- Calming aids (Feliway, Adaptil)

## Step-by-Step Introduction

### Phase 1: Separation (Days 1-3)
Keep pets in separate areas. Feed them on opposite sides of a closed door to create positive associations.

### Phase 2: Visual Introduction (Days 4-7)
Use a baby gate or cracked door. Let pets see each other during feeding times without physical contact.

### Phase 3: Supervised Meetings (Week 2)
Short, controlled meetings with both pets on leash or in carriers. Reward calm behavior with treats.

### Phase 4: Gradual Freedom
Slowly increase unsupervised time together, starting with just a few minutes and building up.

## Reading the Signs

**Positive signs:**
- Relaxed body posture
- Playful behavior (bow, chase)
- Eating near each other
- Grooming themselves calmly

**Warning signs:**
- Stiff posture or staring
- Growling or hissing
- Raised fur
- Tucked tail

## Common Problems

If aggression occurs, go back to Phase 1 and progress more slowly. Never punish pets for aggressive behavior — this increases anxiety and worsens the problem.`
  },
  {
    ...MOCK_POSTS[7],
    authorRole: 'Veterinary Specialist',
    readTime: 7,
    sections: [
      { id: 'signs', title: 'Recognizing Allergies' },
      { id: 'types', title: 'Types of Seasonal Allergies' },
      { id: 'remedies', title: 'Natural Remedies' },
      { id: 'prevention', title: 'Prevention Strategies' }
    ],
    markdownContent: `## Recognizing Allergies

Just like humans, dogs can suffer from seasonal allergies. These allergic reactions occur when a dog's immune system overreacts to environmental allergens like pollen, mold, or dust mites.

### Common Symptoms
- **Itchy skin** (pruritus) — most common sign
- **Paw licking and chewing**
- **Ear infections** — recurrent or chronic
- **Scooting or anal gland issues**
- **Hot spots** — red, moist, irritated lesions
- **Watery eyes**
- **Sneezing or reverse sneezing**
- **Gastrointestinal upset**

### Seasonal Patterns
Note when symptoms appear each year. Spring allergies typically come from tree pollen, summer from grass pollen, and fall from weed pollen.

## Types of Seasonal Allergies

### Atopic Dermatitis
The most common form. Dogs react to inhaled allergens through their skin. Usually affects paws, ears, belly, and armpits.

### Flea Allergy Dermatitis
Even one flea bite can cause intense itching in allergic dogs. Year-round flea prevention is essential.

### Contact Allergies
Reactions to substances that touch the skin — shampoos, bedding, plants. Less common but possible.

## Natural Remedies

### Dietary Support
- Omega-3 fatty acid supplements
- Quercetin-rich foods (blueberries, broccoli)
- Probiotics for immune support

### Topical Relief
- Cool water baths with oatmeal
- Coconut oil application to soothe skin
- Apple cider vinegar (diluted) as a rinse

### Environmental Management
- Regular vacuuming to reduce allergens
- Air purifiers with HEPA filters
- Wiping paws after outdoor walks

## Prevention Strategies

1. Consult your veterinarian for proper diagnosis
2. Start allergy medications before peak season
3. Maintain consistent bathing schedule
4. Keep outdoor time limited during high pollen counts
5. Wash bedding weekly in hot water`
  }
]

export function getBlogPostById(id: string): BlogPostDetail | undefined {
  return MOCK_POST_DETAILS.find((post) => post.id === id)
}
