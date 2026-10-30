/**
 * Menu data for Fastor take-home application.
 * The Fastor staging API does not provide menu or order endpoints,
 * so items, prices, descriptions, and orders are defined here.
 */

function makePortions(tiers) {
  return tiers.map(([id, name, extra = 0.0]) => ({ id, name, extra }));
}

const regularLarge = (extra = 3.0) =>
  makePortions([
    ['regular', 'Regular', 0.0],
    ['large', 'Large', extra],
  ]);

export const BEST_SELLERS = [
  {
    id: 'sushi',
    name: 'Sushi Platter',
    price: 103.0,
    image: '/images/sushi.jpg',
    description:
      'Fresh salmon nigiri and maki rolls with avocado, cucumber, and pickled ginger.',
    portions: makePortions([
      ['6pcs', '6 pcs', 0.0],
      ['8pcs', '8 pcs', 20.0],
      ['12pcs', '12 pcs', 45.0],
    ]),
  },
  {
    id: 'curry',
    name: 'Chicken Curry',
    price: 50.0,
    image: '/images/curry.jpg',
    description:
      'Aromatic chicken curry simmered with authentic spices, served with steamed basmati rice.',
    portions: makePortions([
      ['half', 'Half', 0.0],
      ['full', 'Full', 20.0],
      ['family', 'Family', 45.0],
    ]),
  },
  {
    id: 'lasagna',
    name: 'Baked Lasagna',
    price: 12.99,
    image: '/images/lasagna.jpg',
    description:
      'Classic Italian layered pasta with rich meat ragu, creamy bechamel, and melted mozzarella.',
    portions: regularLarge(4.0),
  },
  {
    id: 'cupcake',
    name: 'Berry Cupcake',
    price: 8.2,
    image: '/images/cupcake.jpg',
    description:
      'Vanilla bean sponge crowned with whipped mascarpone cream and fresh garden berries.',
    portions: regularLarge(2.5),
  },
  {
    id: 'pizza',
    name: 'Pepperoni Pizza',
    price: 14.0,
    image: '/images/pizza.jpg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    portions: [
      { id: 'personal', name: 'Personal (4 Slices)', extra: 0.0 },
      { id: 'medium', name: 'Medium (8 Slices)', extra: 3.0 },
      { id: 'familiar', name: 'Familiar (10 Slices)', extra: 6.0 },
      { id: 'jumbo', name: 'Jumbo (12 Slices)', extra: 10.0 },
    ],
  },
];

export const POPULAR_ITEMS = [
  {
    id: 'shake',
    name: 'Strawberry Shake',
    price: 20.0,
    image: '/images/shake.jpg',
    date: '29 Nov, 01:20 pm',
    itemCountText: '2 items',
    description:
      'Rich, velvety strawberry milkshake crowned with thick whipped cream and fresh strawberries.',
    portions: regularLarge(3.0),
  },
  {
    id: 'burger',
    name: 'Chicken Burger',
    price: 20.0,
    image: '/images/burger.jpg',
    date: '17 Oct, 01:20 pm',
    itemCountText: '1 item',
    description:
      'Grilled chicken patty with crisp lettuce, ripe tomatoes, melted cheese, and toasted brioche buns.',
    portions: regularLarge(4.0),
  },
];

export const PROMO_SLIDES = [
  {
    id: 'promo-1',
    heading: 'Experience our delicious new dish',
    discount: '30% OFF',
    image: '/images/pizza.jpg',
    itemId: 'pizza',
  },
  {
    id: 'promo-2',
    heading: 'Experience our delicious new dish',
    discount: '25% OFF',
    image: '/images/sushi.jpg',
    itemId: 'sushi',
  },
  {
    id: 'promo-3',
    heading: 'Experience our delicious new dish',
    discount: '20% OFF',
    image: '/images/lasagna.jpg',
    itemId: 'lasagna',
  },
];

export const INITIAL_POPULAR_ORDERS = [
  {
    id: 'order-shake',
    itemId: 'shake',
    name: 'Strawberry Shake',
    price: 20.0,
    image: '/images/shake.jpg',
    date: '29 Nov, 01:20 pm',
    itemCountText: '2 items',
    cancelled: false,
  },
  {
    id: 'order-burger',
    itemId: 'burger',
    name: 'Chicken Burger',
    price: 20.0,
    image: '/images/burger.jpg',
    date: '17 Oct, 01:20 pm',
    itemCountText: '1 item',
    cancelled: false,
  },
];

export function getAllMenuItems() {
  const map = new Map();
  [...BEST_SELLERS, ...POPULAR_ITEMS].forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

export function getItemById(id) {
  const all = getAllMenuItems();
  return all.find((item) => item.id === id) || null;
}
