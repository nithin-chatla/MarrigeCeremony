/**
 * WEDDING CONFIGURATION
 * 
 * This is your central place to manage all the details of the wedding.
 * Since this is a static site (perfect for GitHub/Vercel), you update
 * the images by adding their links here.
 */

export const WEDDING_DETAILS = {
  groom: "Sravan",
  bride: "Niharika",
  date: "2026-03-05T09:50:00",
  venue: "Gudipalli, Nalgonda",
  contact: ["8106718860", "8106079690"],
  parents: {
    groom: { father: "Sri Pole Rathnaiah", mother: "Smt. Alivelu", location: "Kodandapuram, Nalgonda" },
    bride: { invitedBy: "Chatla Anjamma", donor: "Sri Chatla Iddaiah - Smt. Jayamma", location: "Madhapuram, Nalgonda" }
  },
  brothers: ["Chatla Nithin", "Chatla Ravichandra"]
};

export interface GalleryImage {
  id: string;
  url: string;
  category: 'Wedding' | 'Family' | 'Travel' | 'Others';
  title: string;
}

/**
 * GALLERY IMAGES
 * 
 * To add new images:
 * 1. Upload your photo to a service like Imgur.com or PostImages.org
 * 2. Copy the "Direct Link" (ends in .jpg or .png)
 * 3. Add a new entry to the array below.
 */
export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', url: 'https://picsum.photos/seed/wedding-1/1200/1600', category: 'Wedding', title: 'The Sacred Vows' },
  { id: '2', url: 'https://picsum.photos/seed/family-1/1200/1600', category: 'Family', title: 'Family Blessing' },
  { id: '3', url: 'https://picsum.photos/seed/travel-1/1200/1600', category: 'Travel', title: 'Sunset in Paris' },
  { id: '4', url: 'https://picsum.photos/seed/others-1/1200/1600', category: 'Others', title: 'The First Date' },
  { id: '5', url: 'https://picsum.photos/seed/wedding-2/1200/1600', category: 'Wedding', title: 'First Dance' },
  { id: '6', url: 'https://picsum.photos/seed/family-2/1200/1600', category: 'Family', title: 'The Grandparents' },
  { id: '7', url: 'https://picsum.photos/seed/travel-2/1200/1600', category: 'Travel', title: 'Mountain Escape' },
  { id: '8', url: 'https://picsum.photos/seed/others-2/1200/1600', category: 'Others', title: 'Engagement Ring' },
  { id: '9', url: 'https://picsum.photos/seed/wedding-3/1200/1600', category: 'Wedding', title: 'Cake Cutting' },
  { id: '10', url: 'https://picsum.photos/seed/family-3/1200/1600', category: 'Family', title: 'The Siblings' },
  { id: '11', url: 'https://picsum.photos/seed/travel-3/1200/1600', category: 'Travel', title: 'Beach Memories' },
  { id: '12', url: 'https://picsum.photos/seed/others-3/1200/1600', category: 'Others', title: 'Morning Coffee' },
];
