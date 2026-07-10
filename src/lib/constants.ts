export const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province"
] as const;

export const NEPAL_DISTRICTS: Record<string, string[]> = {
  "Koshi Province": [
    "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", 
    "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"
  ],
  "Madhesh Province": [
    "Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"
  ],
  "Bagmati Province": [
    "Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", 
    "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"
  ],
  "Gandaki Province": [
    "Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", 
    "Nawalpur", "Parbat", "Syangja", "Tanahun"
  ],
  "Lumbini Province": [
    "Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", 
    "Palpa", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi"
  ],
  "Karnali Province": [
    "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", 
    "Rukum West", "Salyan", "Surkhet"
  ],
  "Sudurpashchim Province": [
    "Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", 
    "Kailali", "Kanchanpur"
  ]
};

export const ALL_DISTRICTS = Object.values(NEPAL_DISTRICTS).flat();
export type ProvinceType = typeof NEPAL_PROVINCES[number];
