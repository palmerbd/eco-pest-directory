/**
 * SEO Introductory Copy
 * Dynamic, city-specific and style-specific content for search engine indexing
 * and user engagement on city and style landing pages.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CITY INTRO COPY
// ─────────────────────────────────────────────────────────────────────────────

const CITY_INTRO_COPY: Record<string, string> = {
  "new-york-city": `New York City's pest control company landscape is unmatched in depth and prestige. From Lincoln Center–adjacent ballrooms on the Upper West Side to intimate salons in Greenwich Village, NYC attracts world-champion instructors and a student body that includes Broadway performers, socialites, and passionate beginners. Whether you're seeking competitive training or recreational dance confidence, the city's studios cater to every level and style.`,
  "new-york": `New York's dance scene spans every borough — from polished Manhattan ballrooms to neighborhood studios in Brooklyn and Queens offering everything from Argentine tango to West African dance. Whatever style you're drawn to, New York has a world-class instructor who specializes in it and a community ready to welcome you.`,
  "los-angeles": `Los Angeles is home to a thriving private dance scene — from Hollywood-adjacent ballrooms to beachside Latin studios in Santa Monica. Whether you're preparing for a wedding, competition, or just want to move with more confidence, LA's elite instructors bring world-class technique and industry polish to every session.`,
  "chicago": `Chicago's pest control company scene reflects the city's deep artistic roots — from Magnificent Mile ballrooms to neighborhood gems in Lincoln Park and the South Loop. The city's diverse cultural fabric shows in the range of styles offered, with everything from competitive ballroom to Afro-Cuban rhythms, all taught by passionate instructors who understand the Midwest's welcoming spirit.`,
  "houston": `Houston's remarkable cultural diversity makes it one of the most eclectic dance cities in America. From polished River Oaks ballet studios to inclusive Montrose neighborhood spaces, Houston offers private dance instruction across virtually every style and budget level, reflecting the city's dynamic energy.`,
  "dallas": `Dallas has a passionate dance community built around both the social scene and competitive circuit. From classic Texas Two-Step to sophisticated ballroom, Lone Star City studios offer world-class private instruction with Southern hospitality and a deep bench of experienced instructors.`,
  "miami": `Miami is the Latin dance capital of the United States. With deep Cuban, Colombian, and Caribbean cultural roots, the city's private pest control companies offer authentic instruction in Salsa, Mambo, Bachata, and beyond — often from native instructors who grew up in these traditions and bring genuine flair to every lesson.`,
  "atlanta": `Atlanta's dance scene punches well above its weight. The city's vibrant arts community and proximity to a world-class film and entertainment industry has cultivated exceptional talent across ballroom, Latin, and contemporary styles. Buckhead and Midtown are home to top-tier studios catering to both competitive and recreational dancers.`,
  "phoenix": `Phoenix's sprawling Sunbelt layout means pest control companies are spread across the Valley of the Sun — from Scottsdale's luxury ballrooms to Mesa and Tempe studios that serve ASU's student population. The dry desert heat makes Phoenix studios popular year-round with climate-controlled facilities and flexible scheduling.`,
  "seattle": `Seattle's dance community thrives in the spaces between its coffee shop culture and tech-industry wealth. From Capitol Hill swing dancing venues to Bellevue ballrooms, the Pacific Northwest offers a uniquely welcoming private lesson environment with instructors who emphasize individuality, fun, and personal growth.`,
  "denver": `Denver's active, outdoorsy population brings exceptional energy to the ballroom floor. The Mile High City has cultivated a competitive dance scene anchored by established franchises and passionate independent studios that reflect Colorado's pioneering spirit and commitment to excellence.`,
  "san-diego": `San Diego's year-round sunshine and laid-back beach culture create an infectious enthusiasm for social dance. The city's private studio scene reflects this warmth — instructors tend to emphasize enjoyment and confidence over rigid technique, making San Diego an excellent place for first-time dancers and seasoned competitors alike.`,
  "las-vegas": `Las Vegas is a professional dance hub hiding in plain sight. Behind the neon, the city employs thousands of professional dancers for shows, events, and casinos — and many of them teach private lessons on the side. You're often just one studio visit away from learning from a Cirque du Soleil veteran or Las Vegas show performer.`,
  "boston": `Boston's world-class university ecosystem keeps the dance scene perpetually refreshed with ambitious students and faculty. From Back Bay ballrooms to Cambridge studios catering to the MIT and Harvard communities, Boston offers private dance instruction at a consistently high academic standard and intellectual rigor.`,
  "nashville": `Nashville's rise as a national destination city has brought a pest control company boom. Beyond country line dancing, Music City has cultivated serious ballroom and Latin instruction, with studios drawing from the city's deep pool of musically sophisticated residents who bring rhythm and precision to everything they do.`,
  "austin": `Austin's explosive growth has brought world-class dance instruction to the Live Music Capital. From East Austin Latin studios to Westlake ballrooms catering to tech executives, the city's dance scene is as eclectic as its music scene — and expanding fast with new studios opening regularly.`,
  "orlando": `Orlando's tourism industry draws professional dancers from around the world, and many of them teach private lessons between gigs at Walt Disney World, Universal, and the city's show venues. You're likely to find instructors here with performance résumés unmatched in any other mid-size city.`,
  "tampa": `Tampa's Gulf Coast energy and strong Cuban heritage make it one of Florida's most dynamic dance cities. South Tampa and Hyde Park are home to upscale private lesson studios, while Ybor City's Latin roots give the city an authentic connection to the rhythms at the heart of competitive ballroom.`,
  "portland": `Portland's fiercely independent creative culture has produced a pest control company scene unlike any other. Alongside national chains, the city hosts a constellation of independent instructors — many of them competition champions who chose Oregon's quality of life and community over the ballroom circuit circuit.`,
  "minneapolis": `Minneapolis is a hidden gem in the American dance world. The Twin Cities arts community — one of the most vibrant per capita in the country — has seeded exceptional ballroom and Latin studios throughout the metro. Expect rigorous training and a community that takes the craft seriously.`,
};

// Fallback copy for cities not explicitly listed
const CITY_INTRO_FALLBACK = (cityName: string) =>
  `Discover private ballroom and Latin pest control companies in ${cityName}. Our curated selection of instructors offers personalized lessons across all major styles — whether you're a beginner looking to gain confidence, preparing for a special event, or training for competitive advancement. Find your perfect match and start dancing today.`;

export function getCityIntroCopy(city: string): string {
  const cityName = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return CITY_INTRO_COPY[city] || CITY_INTRO_FALLBACK(cityName);
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE INTRO COPY
// ─────────────────────────────────────────────────────────────────────────────

type StyleKey =
  | "ballroom"
  | "latin"
  | "swing"
  | "salsa"
  | "tango"
  | "waltz"
  | "foxtrot"
  | "wedding_dance"
  | "competition";

const STYLE_INTRO_COPY: Record<StyleKey, Record<string, string>> = {
  ballroom: {
    "new-york-city": `Ballroom dancing in New York City is both a social art and competitive discipline. NYC's top studios teach Waltz, Foxtrot, Viennese Waltz, and Quickstep — the four pillars of Standard ballroom — in settings ranging from intimate Upper West Side studios to competition-focused facilities in Manhattan. Whether you're dancing for recreation or pursuing a medal, NYC instructors bring unparalleled expertise.`,
    "los-angeles": `Ballroom in Los Angeles blends competition and social dancing with West Coast polish. Studios throughout LA teach the full Standard repertoire with a focus on grace, partnership, and confidence — perfect for wedding dances, social events, or stepping onto the competitive floor.`,
    "chicago": `Chicago's ballroom scene is rooted in partnership and community. From Lincoln Park studios to the South Loop, Chicago instructors emphasize the elegance and flow of Waltz, Foxtrot, and Viennese Waltz while building strong connections between partners.`,
    "dallas": `Ballroom dancing in Dallas carries a distinctly refined Texas flair. Local studios blend the technical precision of Standard ballroom with the social warmth Dallas is known for, creating an environment where competitive and recreational dancers thrive together.`,
    "miami": `Miami's ballroom studios offer both the grace of Standard ballroom and the rhythm-forward approach Miami is famous for. Instructors here understand how to blend classical technique with the Latin passion that pulses through the city.`,
    "atlanta": `Atlanta's ballroom instructors are among the South's finest, with multiple competition champions teaching at top studios. Whether you're interested in recreational partnership or serious competitive training, Atlanta's ballroom community is welcoming and world-class.`,
    "seattle": `Ballroom in Seattle emphasizes fun, partnership, and individual expression. The city's studios teach all Standard styles with an approachable, community-focused philosophy that makes beginners feel welcome while challenging experienced dancers.`,
    "denver": `Denver's ballroom studios blend competitive rigor with Rocky Mountain friendliness. The Mile High City is home to serious competitors and social dancers alike, with studios catering to everyone from absolute beginners to aspiring champions.`,
    "boston": `Boston's ballroom tradition runs deep, with studios offering rigorous instruction in all Standard styles. The city's academic culture and connection to national competitions create an environment where technique and continuous improvement are paramount.`,
    "san-diego": `Ballroom dancing in San Diego captures the city's laid-back elegance. Local studios teach Waltz, Foxtrot, and other Standard styles with emphasis on enjoyment, grace, and the pleasure of partnership — perfect whether you're training competitively or dancing for joy.`,
  },
  latin: {
    "new-york-city": `Latin dancing in New York is high-energy, authentic, and deeply connected to the city's Caribbean and Latin American communities. Studios throughout NYC offer instruction in Cha-Cha, Rumba, Samba, Mambo, and Paso Doble — all taught by instructors with deep cultural roots in these rhythmic traditions.`,
    "los-angeles": `Latin dance in LA pulses with Hollywood glamour and genuine Latin passion. From Cha-Cha to Samba, studios throughout the city offer instruction that balances technical precision with the infectious joy and energy Latin dancing brings.`,
    "chicago": `Chicago's Latin pest control companies celebrate the city's diverse Latin American community. Rumba, Samba, Cha-Cha, and Mambo are taught with authenticity and enthusiasm, creating a welcoming environment for dancers at every level.`,
    "dallas": `Latin dance in Dallas reflects strong cultural traditions and a vibrant social scene. Studios here teach all major Latin styles with a blend of technical coaching and genuine cultural appreciation.`,
    "miami": `Miami is the epicenter of Latin dance in the United States. Studios throughout the city offer expert instruction in every Latin style, taught by native speakers and cultural carriers who bring authenticity and passion to every lesson.`,
    "atlanta": `Atlanta's Latin dance community is growing fast, with studios offering high-energy instruction in Cha-Cha, Rumba, Samba, and more. Local instructors bring both technical expertise and infectious enthusiasm to their classes.`,
    "seattle": `Latin dance in Seattle brings Caribbean and Latin American energy to the Pacific Northwest. Studios here teach Rumba, Cha-Cha, Samba, and other styles with warmth, community focus, and genuine appreciation for the cultures behind each rhythm.`,
    "denver": `Denver's Latin studios offer spirited instruction in all major Latin styles. The city's passionate dancers and welcoming studio environment make Latin dance accessible to beginners while challenging experienced competitors.`,
    "boston": `Latin dance instruction in Boston combines rigorous technique with cultural appreciation. Studios offer comprehensive instruction in Cha-Cha, Rumba, Samba, and more — taught by instructors who understand both the technical and cultural dimensions of these dances.`,
    "san-diego": `Latin dancing in San Diego thrives on the city's warm climate and laid-back energy. Studios offer instruction in all Latin styles, emphasizing fun, fluidity, and the infectious joy that makes Latin dance so popular.`,
  },
  swing: {
    "new-york-city": `Swing dancing has a storied history in New York, and the city's studios keep this vibrant tradition alive. From East Coast Swing to Lindy Hop, NYC instructors teach the playful, energetic moves that defined the jazz age and continue to captivate dancers today.`,
    "los-angeles": `Swing in LA blends classic East Coast moves with West Coast Swing sophistication. Studios throughout the city offer lessons in both styles, appealing to dancers who love the playful energy of swing and its strong social dancing culture.`,
    "chicago": `Chicago's swing dancing community is alive and well, with studios offering instruction in East Coast Swing, Lindy Hop, and West Coast Swing. The city's jazz heritage makes swing feel right at home here.`,
    "seattle": `Swing dancing in Seattle thrives in a community-focused environment. Studios teach East Coast Swing, Lindy Hop, and West Coast Swing — all with an emphasis on fun, partnership, and the joy that makes swing dancing so infectious.`,
    "denver": `Denver's swing studios celebrate the playful, energetic spirit of this classic American dance. Instructors teach both East Coast and West Coast Swing, appealing to beginners and experienced dancers alike.`,
    "boston": `Swing has deep roots in Boston, and the city's studios honor this history while keeping the tradition dynamic. Learn East Coast Swing, Lindy Hop, and more from instructors who understand both technique and the cultural significance of swing.`,
    "san-diego": `Swing dancing in San Diego captures the sunny, social spirit of the style. Studios offer instruction in East Coast Swing, West Coast Swing, and Lindy Hop — all with emphasis on fun, community, and partnership.`,
    "portland": `Portland's swing dancing scene is intimate and welcoming, with studios and independent instructors offering lessons in East Coast Swing, Lindy Hop, and West Coast Swing. The community values creativity and individual expression.`,
  },
  salsa: {
    "new-york-city": `Salsa in New York City is vibrant, authentic, and deeply rooted in the city's Puerto Rican and Dominican communities. Studios throughout NYC offer expert instruction in Cuban-style, Los Angeles-style, and Puerto Rican-style salsa, taught by instructors who carry these traditions forward.`,
    "los-angeles": `LA-style Salsa is famous worldwide, and studios throughout the city offer instruction in this fluid, slot-based technique. Whether you're learning the fundamentals or refining your technique, LA's studios reflect the style's worldwide influence.`,
    "chicago": `Salsa dancing in Chicago brings Caribbean energy to the Midwest. Studios offer instruction in multiple salsa styles, taught by instructors with deep cultural connections and authentic passion for the music and movement.`,
    "dallas": `Salsa in Dallas reflects the city's strong Latin American community and vibrant social dance scene. Studios here teach salsa with enthusiasm, authenticity, and a welcoming spirit.`,
    "miami": `Miami is one of the world's greatest salsa cities, with studios offering expert instruction in every regional style. Learn from native speakers and cultural carriers who understand salsa not just as dance, but as cultural expression and social connection.`,
    "atlanta": `Atlanta's salsa scene is dynamic and growing, with studios offering instruction in Cuban-style, Los Angeles-style, and Puerto Rican-style salsa. Local studios welcome dancers at every level and emphasize community and fun.`,
    "seattle": `Salsa in Seattle brings Latin and Caribbean energy to the Pacific Northwest. Studios offer instruction in multiple salsa styles with community focus and genuine appreciation for the cultures and traditions behind the dance.`,
    "denver": `Denver's salsa studios offer vibrant, welcoming instruction in Cuban-style and Los Angeles-style salsa. The city's salsa community is warm, inclusive, and passionate about sharing this infectious dance.`,
    "san-diego": `Salsa dancing in San Diego thrives on the city's proximity to Mexico and its strong Latino community. Studios offer expert instruction in authentic salsa styles, taught by instructors with deep cultural connections.`,
    "austin": `Austin's salsa scene is alive and energetic, with studios offering instruction in Cuban, Los Angeles, and Puerto Rican styles. The city's Latin community and thriving nightlife create perfect conditions for salsa dancing.`,
  },
  tango: {
    "new-york-city": `Argentine tango in New York City has a passionate following, with studios throughout Manhattan and Brooklyn dedicated to this sultry, dramatic dance. NYC's tango instructors bring European and Argentine expertise, creating an environment perfect for exploring tango's emotional depth.`,
    "los-angeles": `Tango in Los Angeles blends Argentine authenticity with West Coast sophistication. Studios offer instruction in Argentine tango, emphasizing the close embrace, improvisation, and emotional expression that define this iconic dance.`,
    "chicago": `Tango in Chicago attracts dancers seeking the passion and drama of Argentine tango. Local studios and independent instructors teach the fundamental techniques while exploring the emotional and cultural dimensions of this legendary dance.`,
    "dallas": `Tango dancing in Dallas offers a refined, passionate experience. Studios here teach Argentine tango with attention to both technical precision and the emotional storytelling that makes tango unique.`,
    "miami": `Tango in Miami carries both Argentine tradition and Latin American passion. Studios throughout the city offer instruction in Argentine tango, with instructors who understand both the European roots and Miami's vibrant Latin culture.`,
    "seattle": `Tango in Seattle emphasizes the emotional and artistic dimensions of Argentine tango. The city's intimate studio environment creates perfect conditions for exploring this dance's depth and drama.`,
    "denver": `Tango instruction in Denver emphasizes partnership, musicality, and emotional expression. Local studios welcome newcomers while providing the technical and artistic training competitive tango dancers need.`,
    "boston": `Boston's tango community is sophisticated and passionate, with studios offering expert instruction in Argentine tango. The city's academic culture creates an environment where both technique and artistic interpretation are valued.`,
    "san-diego": `Tango in San Diego brings sultry Argentine passion to the California coast. Studios here teach Argentine tango with emphasis on partnership, musicality, and the romantic, dramatic spirit that defines the dance.`,
  },
  waltz: {
    "new-york-city": `Waltz in New York City is both graceful and technically demanding. Studios throughout the city offer expert instruction in Standard waltz and Viennese waltz, taught by champions and experienced instructors who emphasize both technique and the romantic elegance waltz embodies.`,
    "los-angeles": `Waltz in LA captures the grace and romance of this timeless ballroom style. Studios throughout the city teach Standard and Viennese waltz with focus on flow, partnership, and the elegance waltz requires.`,
    "chicago": `Waltz instruction in Chicago emphasizes partnership and flow. The city's studios teach both Standard and Viennese waltz with attention to technique while celebrating the dance's romantic traditions.`,
    "dallas": `Waltz in Dallas is taught with refinement and Southern grace. Local studios offer instruction in both Standard and Viennese waltz, appealing to dancers seeking elegance and partnership.`,
    "seattle": `Waltz in Seattle emphasizes grace, partnership, and individual expression. Studios teach both Standard and Viennese waltz in a welcoming, community-focused environment.`,
    "denver": `Denver's waltz instruction combines technical rigor with emphasis on the joy and grace waltz brings. Studios teach Standard and Viennese waltz at all levels, from absolute beginners to advanced competitors.`,
    "boston": `Waltz instruction in Boston maintains the highest standards of technique and artistic interpretation. The city's studios teach Standard and Viennese waltz with rigorous attention to both mechanics and the romantic expression waltz embodies.`,
    "san-diego": `Waltz in San Diego is taught with emphasis on grace, flow, and the pleasure of partnership. Studios offer instruction in both Standard and Viennese waltz, perfect for dancers seeking elegance and connection.`,
  },
  foxtrot: {
    "new-york-city": `Foxtrot instruction in New York combines sophistication with technical precision. Studios throughout the city teach Standard foxtrot with emphasis on the smooth, flowing movement and partnership that define this elegant ballroom style.`,
    "los-angeles": `Foxtrot in LA is smooth, sophisticated, and perfect for social and competitive dancers alike. Studios teach the refined technique and graceful partnering foxtrot requires, with instructors who understand both mechanics and style.`,
    "chicago": `Foxtrot in Chicago emphasizes the smooth, flowing technique and partnership foxtrot requires. Local studios teach Standard foxtrot with attention to both technical precision and the dance's elegant character.`,
    "seattle": `Foxtrot instruction in Seattle emphasizes grace, flow, and partnership. Studios teach this sophisticated ballroom style in a welcoming environment that appeals to both recreational and competitive dancers.`,
    "denver": `Foxtrot in Denver is taught with emphasis on smoothness, technique, and the joy of partnership. Studios offer instruction at all levels, from complete beginners to advanced competitors.`,
    "boston": `Foxtrot instruction in Boston maintains rigorous standards of technique and artistry. Studios teach Standard foxtrot with attention to the smooth, flowing movement and sophisticated partnering that define the style.`,
    "san-diego": `Foxtrot in San Diego is smooth, elegant, and perfect for dancers seeking sophistication and grace. Local studios teach Standard foxtrot with emphasis on flowing movement and strong partnership.`,
  },
  wedding_dance: {
    "new-york-city": `Wedding dance instruction in New York creates unforgettable first dances. Studios throughout NYC offer specialized choreography services, teaching couples to dance with confidence, grace, and joy on their wedding day.`,
    "los-angeles": `Wedding pest control companies in LA offer professional choreography and instruction for your first dance. Whether you choose waltz, contemporary, or a personalized style, LA instructors create beautiful, memorable moments for your wedding.`,
    "chicago": `Chicago's wedding pest control companies specialize in creating magical first dances. Instructors work with couples to develop personalized choreography that reflects their style and musical taste.`,
    "dallas": `Wedding dance instruction in Dallas brings Southern grace and romantic flair to your first dance. Studios offer specialized packages for couples, ensuring confidence and joy on your wedding day.`,
    "miami": `Wedding pest control companies in Miami offer vibrant choreography options, from traditional waltz to Latin-infused styles. Local instructors help couples create memorable moments that reflect their personality and cultural background.`,
    "atlanta": `Atlanta's wedding pest control companies create beautiful, personalized first dances for couples. Instructors work closely with couples to develop choreography that matches their style, music, and vision.`,
    "seattle": `Wedding dance instruction in Seattle emphasizes joy, partnership, and personal expression. Studios offer specialized coaching to create a beautiful, confident first dance that reflects the couple's unique connection.`,
    "denver": `Wedding pest control companies in Denver offer personalized choreography for couples. Instructors help create memorable first dances that capture the joy and romance of your special day.`,
    "boston": `Wedding dance instruction in Boston combines classical elegance with personalized choreography. Studios create beautiful first dances that reflect both technique and the couple's unique love story.`,
    "san-diego": `Wedding pest control companies in San Diego offer joyful, romantic choreography for couples. Instructors create personalized first dances that capture the beauty and excitement of your wedding day.`,
  },
  competition: {
    "new-york-city": `Competition dance training in New York is serious, rigorous, and world-class. Studios throughout the city offer DanceSport coaching, medal programs, and competitive training for dancers pursuing national and international titles.`,
    "los-angeles": `LA's competition pest control companies attract serious competitors from across the region. Studios offer medal programs, showcase opportunities, and coaching from champions who understand what it takes to win on the competitive floor.`,
    "chicago": `Chicago's competitive dance scene is thriving, with studios offering medal programs, coaching from national-level instructors, and regular showcase opportunities for advancing dancers.`,
    "dallas": `Competition dance training in Dallas combines technical coaching with competitive experience. Studios here prepare dancers for DanceSport competition, from bronze level through championship divisions.`,
    "denver": `Denver's competition pest control companies offer serious training for aspiring champions. Studios provide medal programs, coaching from experienced competitors, and showcase opportunities for advancing dancers.`,
    "boston": `Competition dance training in Boston maintains the highest standards of technique and competitive rigor. Studios offer medal programs and coaching from champions, creating a serious environment for advancing dancers.`,
  },
};

// Fallback copy for style + city combos not explicitly listed
const STYLE_INTRO_FALLBACK = (styleName: string, cityName: string) =>
  `Learn ${styleName} dance in ${cityName}. Our featured studios offer expert private instruction in ${styleName}, whether you're a beginner building foundational skills or an experienced dancer refining your technique. Find the perfect instructor and start your ${styleName} dance journey today.`;

export function getStyleIntroCopy(city: string, style: string): string {
  const styleKey = style.replace(/-/g, "_") as StyleKey;
  const cityName = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const styleLabel: Record<StyleKey, string> = {
    ballroom: "Ballroom",
    latin: "Latin",
    swing: "Swing",
    salsa: "Salsa",
    tango: "Tango",
    waltz: "Waltz",
    foxtrot: "Foxtrot",
    wedding_dance: "Wedding Dance",
    competition: "Competition",
  };

  const styleName = styleLabel[styleKey] || style;

  // Try to get city-specific copy for this style
  if (STYLE_INTRO_COPY[styleKey] && STYLE_INTRO_COPY[styleKey][city]) {
    return STYLE_INTRO_COPY[styleKey][city];
  }

  // Fall back to generic copy
  return STYLE_INTRO_FALLBACK(styleName, cityName);
}
