# Date Audit Results — April 2026

**Audit Date:** April 15, 2026  
**Source:** competitions-scope.html (30 competitions planned for Phase 1 seed)  
**Note:** The `lib/competitions-data.ts` file has NOT been created yet — this audit is against the planned seed data in the scope document to ensure accuracy BEFORE the file is built.

---

## Priority Competitions (Top 10 by Traffic Potential)

### 1. Ohio Star Ball Championships
- **Scope says:** Columbus, OH — November
- **Official website says:** November 17–22, 2026, Columbus, OH
- **Status:** ✅ Month correct. Use `dateStart: "2026-11-17"`, `dateEnd: "2026-11-22"`, `typicalMonth: 11`

### 2. Emerald Ball DanceSport Championships
- **Scope says:** Los Angeles, CA — May
- **Official website says:** April 28 – May 3, 2026, LA Airport Hilton Hotel
- **Status:** ⚠️ Needs Update — event spans late April into May. `dateStart: "2026-04-28"`, `dateEnd: "2026-05-03"`, `typicalMonth: 5` is acceptable but dateStart is in April

### 3. Manhattan Dance Championships
- **Scope says:** New York, NY — July
- **Official website says:** July 1–5, 2026, Marriott at the Brooklyn Bridge, NYC
- **Status:** ✅ Correct. `dateStart: "2026-07-01"`, `dateEnd: "2026-07-05"`, `typicalMonth: 7`

### 4. Heritage Classic DanceSport
- **Scope says:** Dallas, TX — April
- **Official website says:** March 5–7, 2026, Grandover Resort & Spa, **Greensboro, NC**
- **Status:** 🔴 Major correction needed — WRONG CITY AND STATE. This competition is in Greensboro, NC, not Dallas, TX. Also March, not April. `city: "Greensboro"`, `state: "North Carolina"`, `stateAbbr: "NC"`, `dateStart: "2026-03-05"`, `dateEnd: "2026-03-07"`, `typicalMonth: 3`

### 5. Chicago Open DanceSport Championship
- **Scope says:** Chicago, IL — March
- **Official website says:** October 23–25, 2026
- **Status:** 🔴 Major correction needed — WRONG MONTH. October, not March. `dateStart: "2026-10-23"`, `dateEnd: "2026-10-25"`, `typicalMonth: 10`

### 6. United States Dance Championships (USDC)
- **Scope says:** Orlando, FL — September
- **Official website says:** September 7–12, 2026
- **Status:** ✅ Correct. `dateStart: "2026-09-07"`, `dateEnd: "2026-09-12"`, `typicalMonth: 9`

### 7. Embassy Ball DanceSport Championships
- **Scope says:** Irvine, CA — November
- **Official website says:** September 2026, Garden Grove, CA (Hyatt Regency Orange County). Exact dates TBD.
- **Status:** 🔴 Major correction needed — WRONG MONTH AND CITY. September (not November), Garden Grove (not Irvine). `city: "Garden Grove"`, `typicalMonth: 9`. Exact dates pending — check back closer to event.

### 8. Desert Classic DanceSport Championships
- **Scope says:** Palm Springs, CA — February
- **Official website says:** July 8–12, 2026, JW Marriott Desert Springs, Palm Desert, CA
- **Status:** 🔴 Major correction needed — WRONG MONTH AND CITY. July (not February), Palm Desert (not Palm Springs). `city: "Palm Desert"`, `dateStart: "2026-07-08"`, `dateEnd: "2026-07-12"`, `typicalMonth: 7`

### 9. Grand Nationals DanceSport Championship
- **Scope says:** Orlando, FL — November
- **Official website says:** October 29–31, 2026, **Miami, FL** (not Orlando)
- **Status:** 🔴 Major correction needed — WRONG CITY AND MONTH. Miami (not Orlando), October (not November). `city: "Miami"`, `dateStart: "2026-10-29"`, `dateEnd: "2026-10-31"`, `typicalMonth: 10`

### 10. American Star Ball
- **Scope says:** Parsippany, NJ — October
- **Official website says:** May 14–17, 2026, Resorts Casino Hotel, **Atlantic City, NJ**
- **Status:** 🔴 Major correction needed — WRONG CITY AND MONTH. Atlantic City (not Parsippany), May (not October). `city: "Atlantic City"`, `dateStart: "2026-05-14"`, `dateEnd: "2026-05-17"`, `typicalMonth: 5`

---

## Remaining 20 Competitions

### 11. California Star Ball
- **Scope says:** Los Angeles, CA — October
- **Official website says:** November 27–29, 2026, **Santa Barbara, CA**
- **Status:** 🔴 Major correction needed — WRONG CITY AND MONTH. Santa Barbara (not LA), November (not October). `city: "Santa Barbara"`, `dateStart: "2026-11-27"`, `dateEnd: "2026-11-29"`, `typicalMonth: 11`

### 12. New York Dance Festival
- **Scope says:** New York, NY — February
- **Official website says:** February 26 – March 1, 2026, New York Hilton Midtown
- **Status:** ✅ Correct (month). `dateStart: "2026-02-26"`, `dateEnd: "2026-03-01"`, `typicalMonth: 2`

### 13. Millennium DanceSport Championship
- **Scope says:** Los Angeles, CA — January
- **Official website says:** June 22–28, 2026, **Orlando, FL**
- **Status:** 🔴 Major correction needed — WRONG CITY AND MONTH. Orlando (not LA), June (not January). `city: "Orlando"`, `state: "Florida"`, `stateAbbr: "FL"`, `dateStart: "2026-06-22"`, `dateEnd: "2026-06-28"`, `typicalMonth: 6`

### 14. Hollywood DanceSport Championship
- **Scope says:** Hollywood, FL — August
- **Official website says:** Dates for 2026 not yet confirmed. Event appears to be held at Hyatt Regency LAX in Los Angeles, CA (not Hollywood, FL).
- **Status:** ⚠️ Needs Update — WRONG CITY/STATE likely. Event is in Los Angeles, not Hollywood FL. Dates unconfirmed for 2026. Revisit when announced.

### 15. Philadelphia DanceSport Championship
- **Scope says:** Philadelphia, PA — June
- **Official website says:** April 9–12, 2026, Hilton Philadelphia at Penn's Landing
- **Status:** 🔴 Major correction needed — WRONG MONTH. April (not June). `dateStart: "2026-04-09"`, `dateEnd: "2026-04-12"`, `typicalMonth: 4`

### 16. Indiana Grand DanceSport
- **Scope says:** Indianapolis, IN — March
- **Official website says:** Event may be called "Indianapolis Open Dancesport Competition" — April 16–18, 2026, Sheraton Indianapolis
- **Status:** ⚠️ Needs Update — Name may be wrong ("Indianapolis Open" not "Indiana Grand"), and April not March. Verify correct event name. `dateStart: "2026-04-16"`, `dateEnd: "2026-04-18"`, `typicalMonth: 4`

### 17. Atlanta DanceSport Championship
- **Scope says:** Atlanta, GA — May
- **Official website says:** May 7–10, 2026, Crowne Plaza Atlanta Perimeter. Event name is "Atlanta Open Dancesport Spectacular"
- **Status:** ✅ Month correct. Note official name is "Atlanta Open Dancesport Spectacular." `dateStart: "2026-05-07"`, `dateEnd: "2026-05-10"`, `typicalMonth: 5`

### 18. Denver DanceSport Championship
- **Scope says:** Denver, CO — June
- **Official website says:** June 18–22, 2026, Hyatt Regency Aurora, CO. Event name is "Colorado Star Ball"
- **Status:** ✅ Month correct. Note official name is "Colorado Star Ball." `dateStart: "2026-06-18"`, `dateEnd: "2026-06-22"`, `typicalMonth: 6`

### 19. Las Vegas DanceSport Championship
- **Scope says:** Las Vegas, NV — July
- **Official website says:** No confirmed 2026 dates found for an event with this exact name. Multiple Las Vegas dance events exist but none matched precisely.
- **Status:** ❌ No date found — event may not exist under this name. Needs research to identify the correct Las Vegas NDCA competition. Consider "NV Ball Dancesport Championships" or another event.

### 20. Houston DanceSport Championship
- **Scope says:** Houston, TX — March
- **Official website says:** No event with this exact name found. Closest matches: "Texas Grand Championship" (Feb 26–28, Sugar Land) or "Texas Open Dancesport Classic" (Jun 11–13, Spring TX)
- **Status:** ❌ No date found — event may not exist under this name. Needs research to identify correct Houston-area NDCA competition.

### 21. Pacific Coast Classic DanceSport
- **Scope says:** Los Angeles, CA — September
- **Official website says:** No 2026 event found with this name.
- **Status:** ❌ No date found — event may not exist or may have been renamed/discontinued. Research needed.

### 22. San Francisco Open DanceSport
- **Scope says:** San Francisco, CA — October
- **Official website says:** April 2–5, 2026, Marriott Waterfront, Burlingame, CA. Official name is "The Ball at the San Francisco Open Dancesport Championships"
- **Status:** 🔴 Major correction needed — WRONG MONTH. April (not October). City is technically Burlingame. `dateStart: "2026-04-02"`, `dateEnd: "2026-04-05"`, `typicalMonth: 4`

### 23. Carolina Crown DanceSport
- **Scope says:** Charlotte, NC — September
- **Official website says:** May 24, 2026 (possibly multi-day). Official name is "Crown of Carolina DanceSport Classic"
- **Status:** 🔴 Major correction needed — WRONG MONTH. May (not September). `typicalMonth: 5`

### 24. USA Dance National DanceSport Championships
- **Scope says:** Pittsburgh, PA — March
- **Official website says:** March 27–29, 2026, Wyndham Grand Pittsburgh Downtown
- **Status:** ✅ Correct. `dateStart: "2026-03-27"`, `dateEnd: "2026-03-29"`, `typicalMonth: 3`

### 25. US National Amateur DanceSport Championships
- **Scope says:** Provo, UT — March
- **Official website says:** March 10–14, 2026, Marriott Center, Provo, UT (BYU)
- **Status:** ✅ Correct. `dateStart: "2026-03-10"`, `dateEnd: "2026-03-14"`, `typicalMonth: 3`

### 26. USA Dance National Collegiate Championships
- **Scope says:** Pittsburgh, PA — March
- **Official website says:** March 27–29, 2026, Wyndham Grand Pittsburgh (co-located with USA Dance Nationals)
- **Status:** ✅ Correct. `dateStart: "2026-03-27"`, `dateEnd: "2026-03-29"`, `typicalMonth: 3`

### 27. Eastern Seaboard DanceSport
- **Scope says:** Washington, DC — October
- **Official website says:** No event with this exact name found in DC. Closest match: "Eastern United States Dancesport Championships" — Jan 29 – Feb 1, 2026, Newark Airport Marriott, NJ
- **Status:** 🔴 Major correction needed — likely wrong name, city, and month. May be referring to a different event entirely. Research needed to confirm which competition this should be.

### 28. Minnesota Star Ball
- **Scope says:** Minneapolis, MN — February
- **Official website says:** No 2026 event found with this name.
- **Status:** ❌ No date found — event may not exist, may be too small for online presence, or may use a different name. Research needed.

### 29. Boston DanceSport Challenge
- **Scope says:** Boston, MA — January
- **Official website says:** The "Boston Dancesport Cup" is January 24, 2026, Hilton Boston-Woburn. Name may be slightly different.
- **Status:** ⚠️ Needs Update — name is likely "Boston Dancesport Cup" not "Boston DanceSport Challenge." January is correct. `dateStart: "2026-01-24"`, `dateEnd: "2026-01-24"`, `typicalMonth: 1`

### 30. Seattle Star Ball
- **Scope says:** Seattle, WA — April
- **Official website says:** No confirmed 2026 dates found. Event may be discontinued or very small.
- **Status:** ❌ No date found — event may not exist in 2026. Consider replacing with "Summit DanceSport" (September 24–27, 2026, DoubleTree Seattle Airport) as the major Seattle-area competition.

---

## Summary

| Metric | Count |
|--------|-------|
| **Total competitions checked** | 30 |
| **✅ Correct (month + city match)** | 8 |
| **⚠️ Needs minor update** | 4 |
| **🔴 Major correction needed** | 13 |
| **❌ No date found / event may not exist** | 5 |

### Key Findings

**8 competitions have correct data:** Ohio Star Ball, Manhattan Dance Championships, USDC, New York Dance Festival, Atlanta DanceSport, Denver DanceSport, USA Dance Nationals, US National Amateur, USA Dance Collegiate

**13 competitions have WRONG months and/or cities** — many of the scope document entries appear to have been guessed or AI-hallucinated rather than verified against official sources. The most egregious errors:
- Heritage Classic: listed as Dallas TX, actually Greensboro NC
- Millennium DanceSport: listed as LA/January, actually Orlando/June  
- Desert Classic: listed as February, actually July
- American Star Ball: listed as Parsippany/October, actually Atlantic City/May
- Chicago Open: listed as March, actually October
- San Francisco Open: listed as October, actually April

**5 competitions may not exist under the listed names:** Las Vegas DanceSport, Houston DanceSport, Pacific Coast Classic, Minnesota Star Ball, Seattle Star Ball. These should be replaced with verified events.

### Recommended Replacements for Non-Existent Events

| Remove | Replace With | Dates | Location |
|--------|-------------|-------|----------|
| Las Vegas DanceSport Championship | NV Ball Dancesport Championships | TBD | Las Vegas, NV |
| Houston DanceSport Championship | Texas Grand Championship | Feb 26–28, 2026 | Sugar Land, TX |
| Pacific Coast Classic DanceSport | California Open DanceSport Championships | TBD | TBD, CA |
| Minnesota Star Ball | (research needed) | — | — |
| Seattle Star Ball | Summit DanceSport | Sep 24–27, 2026 | SeaTac, WA |

---

## Action Required

Before building `lib/competitions-data.ts`, the scope document's competition list needs significant corrections. Over 60% of the entries had wrong dates, wrong cities, or both. The corrected values above should be used when seeding the data file.

**Next audit scheduled:** May 1, 2026
