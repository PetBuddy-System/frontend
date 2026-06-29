export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  categoryLabel: string
  author: string
  date: string
  imageUrl: string
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Essential Supplies Every New Pet Owner Needs',
    excerpt:
      'Bringing a new pet home is exciting, but being prepared with the right supplies makes the transition smoother for both you and your furry friend. Here are the must-have items every new pet parent should have.',
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
      'Dogs communicate through body language, and learning to read their signals helps build a stronger bond. From tail wags to ear positions, here is how to understand what your dog is telling you.',
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
      'Puppies have different nutritional needs at every growth stage. Learn how to choose the right food, feeding schedule, and supplements for your growing pup from 8 weeks to 12 months.',
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
      'Should you groom your pet at home or visit a professional? We break down the costs, benefits, and time investment of both options so you can decide what works best for your pet.',
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
      'As cats age, they face unique health challenges. From kidney disease to arthritis, knowing the signs of common senior cat health issues helps you provide the best care for your aging feline.',
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
      'Rainy days and hot afternoons do not have to mean bored pets. These creative indoor games and activities will keep your dog or cat mentally stimulated and physically active at home.',
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
      'Introducing a new pet to your household takes patience and strategy. Follow our step-by-step guide to help your pets adjust and build positive relationships from day one.',
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
      'Just like humans, dogs can suffer from seasonal allergies. Learn to identify the symptoms and explore safe, natural remedies to keep your dog comfortable year-round.',
    category: 'health',
    categoryLabel: 'Health',
    author: 'Dr. Lan Nguyen',
    date: 'Dec 28, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&q=80'
  }
]
