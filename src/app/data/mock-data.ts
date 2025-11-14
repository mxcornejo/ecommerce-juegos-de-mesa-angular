import { Category } from '../models/category.interface';
import { Product } from '../models/product.interface';

// Mock data: 4 categorías de juegos de mesa
export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Juegos de Estrategia',
    image: 'assets/categories/strategy.jpg',
    slug: 'estrategia',
  },
  {
    id: 2,
    name: 'Juegos Familiares',
    image: 'assets/categories/family.jpg',
    slug: 'familiares',
  },
  {
    id: 3,
    name: 'Juegos de Cartas',
    image: 'assets/categories/cards.jpg',
    slug: 'cartas',
  },
  {
    id: 4,
    name: 'Juegos de Rol',
    image: 'assets/categories/roleplay.jpg',
    slug: 'rol',
  },
];

// Mock data: 3 productos por categoría (12 productos en total)
export const PRODUCTS: Product[] = [
  // Categoría 1: Juegos de Estrategia (3 productos)
  {
    id: 1,
    name: 'Catan',
    description:
      'Construye asentamientos, ciudades y caminos mientras compites por los recursos de la isla de Catán.',
    price: 34990,
    image: 'assets/juegos/catan.jpg',
    categoryId: 1,
  },
  {
    id: 2,
    name: 'Carcassonne',
    description:
      'Construye un paisaje medieval colocando fichas y reclamando territorios con tus seguidores.',
    price: 29990,
    image: 'assets/juegos/carcassonne.jpg',
    categoryId: 1,
  },
  {
    id: 3,
    name: 'Pandemic',
    description:
      'Trabaja en equipo para salvar a la humanidad de cuatro enfermedades mortales que amenazan el mundo.',
    price: 39990,
    image: 'assets/juegos/pandemic.jpg',
    categoryId: 1,
  },

  // Categoría 2: Juegos Familiares (3 productos)
  {
    id: 4,
    name: 'Ticket to Ride',
    description:
      'Construye rutas de tren a través de distintos países y ciudades en esta emocionante aventura ferroviaria.',
    price: 44990,
    image: 'assets/juegos/tickettoride.jpg',
    categoryId: 2,
  },
  {
    id: 5,
    name: 'Azul',
    description: 'Decora las paredes del Palacio Real de Évora con hermosos azulejos portugueses.',
    price: 32990,
    image: 'assets/juegos/azul.jpg',
    categoryId: 2,
  },
  {
    id: 6,
    name: 'Dixit',
    description:
      'Un juego de creatividad e imaginación donde las imágenes cobran vida con tus historias.',
    price: 36990,
    image: 'assets/juegos/dixit.jpg',
    categoryId: 2,
  },

  // Categoría 3: Juegos de Cartas (3 productos)
  {
    id: 7,
    name: 'UNO',
    description: 'El clásico juego de cartas que todos conocen y aman. ¡No olvides gritar UNO!',
    price: 9990,
    image: 'assets/juegos/uno.jpg',
    categoryId: 3,
  },
  {
    id: 8,
    name: 'Exploding Kittens',
    description: 'Un juego de cartas estratégico lleno de gatitos, explosiones y locura absoluta.',
    price: 19990,
    image: 'assets/juegos/ExplodingKittens.jpg',
    categoryId: 3,
  },
  {
    id: 9,
    name: 'Sushi Go!',
    description: 'Selecciona y pasa cartas de delicioso sushi en este rápido juego de drafting.',
    price: 14990,
    image: 'assets/juegos/SushiGo.jpg',
    categoryId: 3,
  },

  // Categoría 4: Juegos de Rol (3 productos)
  {
    id: 10,
    name: 'Dungeons & Dragons',
    description:
      'El legendario juego de rol donde tu imaginación es el límite. Crea tu héroe y vive aventuras épicas.',
    price: 54990,
    image: 'assets/juegos/Dungeons.jpg',
    categoryId: 4,
  },
  {
    id: 11,
    name: 'Pathfinder',
    description:
      'Un completo sistema de juego de rol de fantasía con infinitas posibilidades de aventura.',
    price: 49990,
    image: 'assets/juegos/Pathfinder.jpg',
    categoryId: 4,
  },
  {
    id: 12,
    name: 'Tales from the Loop',
    description:
      'Vive aventuras en los años 80 en un mundo donde la tecnología retro-futurista es real.',
    price: 44990,
    image: 'assets/juegos/Tales.jpg',
    categoryId: 4,
  },
];

// Función helper para obtener productos por categoría
export function getProductsByCategory(categoryId: number): Product[] {
  return PRODUCTS.filter((product) => product.categoryId === categoryId);
}
