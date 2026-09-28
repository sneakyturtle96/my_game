// ===== SVENSKA ORDBANK =====
// Varje tema har en lista med ord. Spelet plockar slumpmässigt ord
// och spelaren ska fånga ord som tillhör rätt ordklass.

const SWEDISH_DATA = {
    substantiv: {
        theme: 'Substantiv',
        words: [
            'hund', 'katt', 'häst', 'bil', 'cykel', 'bok', 'bord', 'stol',
            'fönster', 'dörr', 'hus', 'väg', 'stad', 'land', 'hav', 'berg',
            'skog', 'blomma', 'träd', 'fågel', 'fisk', 'björn', 'varg', 'räv',
            'människa', 'barn', 'kvinna', 'man', 'vän', 'familj', 'skola', 'lärare',
            'elev', 'penna', 'papper', 'dator', 'telefon', 'klocka', 'nyckel', 'väska',
            'mat', 'vatten', 'mjölk', 'bröd', 'ost', 'äpple', 'banan', 'potatis'
        ]
    },
    verb: {
        theme: 'Verb',
        words: [
            'springa', 'gå', 'hoppa', 'sitta', 'stå', 'ligga', 'äta', 'dricka',
            'sova', 'vakna', 'tala', 'lyssna', 'se', 'titta', 'läsa', 'skriva',
            'rita', 'måla', 'sjunga', 'dansa', 'spela', 'arbeta', 'vila', 'hjälpa',
            'tycka', 'tänka', 'veta', 'förstå', 'lära', 'glömma', 'minnas', 'köpa',
            'sälja', 'ge', 'ta', 'öppna', 'stänga', 'börja', 'sluta', 'vänta',
            'springer', 'går', 'äter', 'sover', 'talar', 'läser', 'skriver', 'tänker'
        ]
    },
    adjektiv: {
        theme: 'Adjektiv',
        words: [
            'stor', 'liten', 'lång', 'kort', 'hög', 'låg', 'bred', 'smal',
            'tjock', 'tunn', 'snabb', 'långsam', 'varm', 'kall', 'het', 'sval',
            'ljus', 'mörk', 'röd', 'blå', 'grön', 'gul', 'svart', 'vit',
            'glad', 'ledsen', 'arg', 'rädd', 'lugn', 'stressad', 'trött', 'pigg',
            'ung', 'gammal', 'ny', 'gammal', 'rik', 'fattig', 'stark', 'svag',
            'vacker', 'ful', 'ren', 'smutsig', 'lätt', 'svår', 'rolig', 'tråkig'
        ]
    },
    prepositioner: {
        theme: 'Prepositioner',
        words: [
            'på', 'i', 'under', 'över', 'bredvid', 'bakom', 'framför', 'mellan',
            'genom', 'mot', 'från', 'till', 'med', 'utan', 'för', 'efter',
            'före', 'sedan', 'runt', 'omkring', 'ovan', 'nedan', 'innanför', 'utanför',
            'längs', 'tvärtom', 'enligt', 'angående', 'trots', 'under', 'bland', 'inom',
            'utom', 'nära', 'intill', 'ovanpå', 'underifrån', 'emot', 'kring', 'via'
        ]
    },
    pronomen: {
        theme: 'Pronomen',
        words: [
            'jag', 'du', 'han', 'hon', 'den', 'det', 'vi', 'ni',
            'de', 'dem', 'mig', 'dig', 'honom', 'henne', 'oss', 'er',
            'min', 'din', 'hans', 'hennes', 'vår', 'er', 'deras', 'sin',
            'denna', 'detta', 'dessa', 'den här', 'det här', 'de här', 'sådan', 'sådant',
            'någon', 'något', 'några', 'ingen', 'inget', 'inga', 'varandra', 'varann',
            ' vem', 'vad', 'vilken', 'vilket', 'vilka', 'som', 'själv', 'själva'
        ]
    }
};