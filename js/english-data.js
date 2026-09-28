// ===== ENGELSK ORDBANK =====
// Varje kategori har 100 ord. Spelet visar ett tema och spelaren ska
// fånga ord som tillhör temat.

const ENGLISH_DATA = {
    animals: {
        theme: 'Animals',
        words: [
            'dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken',
            'duck', 'goose', 'rabbit', 'mouse', 'rat', 'hamster', 'guinea pig', 'ferret',
            'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'gorilla', 'chimpanzee',
            'bear', 'wolf', 'fox', 'deer', 'moose', 'elk', 'rabbit', 'squirrel',
            'badger', 'otter', 'beaver', 'hedgehog', 'bat', 'whale', 'dolphin', 'shark',
            'seal', 'walrus', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'jellyfish',
            'snake', 'lizard', 'turtle', 'tortoise', 'crocodile', 'alligator', 'frog', 'toad',
            'eagle', 'hawk', 'owl', 'falcon', 'parrot', 'penguin', 'ostrich', 'flamingo',
            'swan', 'pelican', 'seagull', 'pigeon', 'sparrow', 'robin', 'crow', 'magpie',
            'ant', 'bee', 'wasp', 'butterfly', 'moth', 'dragonfly', 'beetle', 'spider',
            'scorpion', 'snail', 'slug', 'worm', 'centipede', 'millipede', 'ladybug', 'grasshopper',
            'camel', 'llama', 'alpaca', 'donkey', 'mule', 'kangaroo', 'koala', 'panda',
            'hippopotamus', 'rhinoceros', 'leopard', 'cheetah'
        ]
    },
    fruits: {
        theme: 'Fruits',
        words: [
            'apple', 'banana', 'orange', 'pear', 'peach', 'plum', 'apricot', 'cherry',
            'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry', 'gooseberry', 'elderberry', 'currant',
            'grape', 'watermelon', 'cantaloupe', 'honeydew', 'pineapple', 'mango', 'papaya', 'guava',
            'kiwi', 'passion fruit', 'pomegranate', 'fig', 'date', 'coconut', 'avocado', 'lemon',
            'lime', 'grapefruit', 'tangerine', 'mandarin', 'clementine', 'kumquat', 'pomelo', 'lychee',
            'dragon fruit', 'star fruit', 'rambutan', 'mangosteen', 'durian', 'jackfruit', 'breadfruit', 'plantain',
            'persimmon', 'quince', 'medlar', 'loquat', 'mulberry', 'boysenberry', 'loganberry', 'tayberry',
            'nectarine', 'acai', 'goji berry', 'bilberry', 'cloudberry', 'huckleberry', 'salmonberry', 'soursop',
            'cherimoya', 'sapodilla', 'tamarind', 'jujube', 'ackee', 'miracle fruit', 'physalis', 'cape gooseberry',
            'feijoa', 'prickly pear', 'horned melon', 'bitter melon', 'chayote', 'santol', 'black sapote', 'white sapote',
            'mamey sapote', 'canistel', 'abiu', 'cupuacu', 'bacuri', 'pequi', 'buriti', 'camu camu',
            'guarana', 'pitanga', 'jabuticaba', 'cabeluda', 'araticum', 'mangaba', 'umbu', 'seriguela',
            'caja', 'babacu', 'baru', 'pequi'
        ]
    },
    vegetables: {
        theme: 'Vegetables',
        words: [
            'carrot', 'potato', 'tomato', 'onion', 'garlic', 'leek', 'shallot', 'spring onion',
            'cabbage', 'lettuce', 'spinach', 'kale', 'arugula', 'chard', 'watercress', 'endive',
            'broccoli', 'cauliflower', 'brussels sprout', 'kohlrabi', 'bok choy', 'collard greens', 'mustard greens', 'turnip',
            'radish', 'beetroot', 'parsnip', 'rutabaga', 'swede', 'celery', 'celeriac', 'fennel',
            'cucumber', 'zucchini', 'courgette', 'squash', 'pumpkin', 'butternut', 'acorn squash', 'spaghetti squash',
            'eggplant', 'aubergine', 'pepper', 'bell pepper', 'chili', 'jalapeno', 'habanero', 'poblano',
            'pea', 'green bean', 'snap pea', 'snow pea', 'lentil', 'chickpea', 'kidney bean', 'black bean',
            'soybean', 'edamame', 'mung bean', 'pinto bean', 'navy bean', 'fava bean', 'lima bean', 'runner bean',
            'corn', 'sweetcorn', 'asparagus', 'artichoke', 'rhubarb', 'okra', 'kohlrabi', 'jerusalem artichoke',
            'sweet potato', 'yam', 'taro', 'cassava', 'parsnip', 'horseradish', 'ginger', 'turmeric',
            'mushroom', 'portobello', 'shiitake', 'oyster mushroom', 'button mushroom', 'enoki', 'chanterelle', 'truffle',
            'seaweed', 'kelp', 'nori', 'wakame', 'dulse', 'spirulina', 'chlorella', 'agar',
            'sprout', 'alfalfa', 'bean sprout', 'microgreen', 'wheatgrass', 'watercress', 'radish sprout', 'broccoli sprout'
        ]
    },
    body_parts: {
        theme: 'Body Parts',
        words: [
            'head', 'hair', 'face', 'forehead', 'eye', 'eyebrow', 'eyelash', 'ear',
            'nose', 'mouth', 'lip', 'tooth', 'teeth', 'tongue', 'chin', 'cheek',
            'neck', 'throat', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger',
            'thumb', 'nail', 'chest', 'back', 'stomach', 'waist', 'hip', 'leg',
            'thigh', 'knee', 'shin', 'calf', 'ankle', 'foot', 'toe', 'heel',
            'skin', 'muscle', 'bone', 'joint', 'tendon', 'ligament', 'cartilage', 'nerve',
            'brain', 'heart', 'lung', 'liver', 'kidney', 'stomach', 'intestine', 'pancreas',
            'spleen', 'bladder', 'vein', 'artery', 'blood', 'plasma', 'cell', 'tissue',
            'spine', 'rib', 'skull', 'jaw', 'pelvis', 'collarbone', 'shoulder blade', 'breastbone',
            'palm', 'knuckle', 'fingertip', 'forearm', 'upper arm', 'bicep', 'tricep', 'armpit',
            'eyelid', 'pupil', 'iris', 'cornea', 'retina', 'optic nerve', 'eardrum', 'nostril',
            'vocal cord', 'gum', 'palate', 'uvula', 'tonsil', 'salivary gland', 'thyroid', 'adrenal gland',
            'pituitary', 'hypothalamus', 'cerebellum', 'brainstem', 'spinal cord', 'marrow', 'plasma', 'platelet'
        ]
    },
    colors: {
        theme: 'Colors',
        words: [
            'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
            'black', 'white', 'gray', 'grey', 'silver', 'gold', 'bronze', 'copper',
            'beige', 'tan', 'cream', 'ivory', 'pearl', 'ebony', 'charcoal', 'slate',
            'navy', 'teal', 'turquoise', 'aqua', 'cyan', 'mint', 'emerald', 'olive',
            'lime', 'chartreuse', 'amber', 'mustard', 'maroon', 'crimson', 'scarlet', 'ruby',
            'burgundy', 'wine', 'rose', 'salmon', 'coral', 'peach', 'apricot', 'tangerine',
            'lavender', 'lilac', 'violet', 'plum', 'magenta', 'fuchsia', 'mauve', 'orchid',
            'indigo', 'sapphire', 'cobalt', 'azure', 'sky blue', 'baby blue', 'powder blue', 'steel blue',
            'forest green', 'sea green', 'lime green', 'olive green', 'sage', 'moss', 'khaki', 'taupe',
            'chocolate', 'coffee', 'caramel', 'honey', 'wheat', 'sand', 'rust', 'terracotta',
            'pastel', 'neon', 'metallic', 'matte', 'glossy', 'shiny', 'dull', 'bright',
            'dark', 'light', 'pale', 'deep', 'vivid', 'muted', 'warm', 'cool',
            'primary', 'secondary', 'tertiary', 'complementary', 'monochrome', 'rainbow', 'prism', 'spectrum',
            'colorful', 'colorless', 'multicolored', 'two-tone', 'tri-color', 'ombre', 'gradient', 'shade'
        ]
    }
};