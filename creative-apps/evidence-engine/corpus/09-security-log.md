# Electronic Access Log — Holbrooke Gallery

**System:** Salto ProAccess SPACE v3.7  
**Export generated:** 2025-10-15 08:12:44  
**Requested by:** Detective Constable Priya Mehta, Camden CID  
**Covering period:** 2025-10-14 00:00:00 to 2025-10-15 00:00:00  
**Log reference:** SALTO-HGA-20251014  

---

## Reader Configuration

| Reader ID | Location | Direction |
|-----------|----------|-----------|
| READER_01_MAIN_DOOR | Main entrance (27 Westbourne Terrace) | Entry + Exit |
| READER_02_OFFICE | Private office (corridor side) | Entry + Exit |
| READER_03_STORE | Secure storage room | Entry + Exit |

---

## Access Events — 14 October 2025

```
2025-10-14 09:04:17 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041)      | STATUS: VALID
2025-10-14 11:02:33 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: Victor Holt (VH-0001)       | STATUS: VALID
2025-10-14 17:02:08 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014) | STATUS: VALID (temporary day pass)
2025-10-14 17:44:19 | CARD_ENTRY | READER_02_OFFICE    | HOLDER: Victor Holt (VH-0001)       | STATUS: VALID
2025-10-14 17:44:44 | CARD_ENTRY | READER_02_OFFICE    | HOLDER: Helena Voss (HV-0041)       | STATUS: VALID
2025-10-14 18:07:55 | CARD_EXIT  | READER_02_OFFICE    | HOLDER: Victor Holt (VH-0001)       | STATUS: VALID
2025-10-14 18:08:03 | CARD_EXIT  | READER_02_OFFICE    | HOLDER: Helena Voss (HV-0041)       | STATUS: VALID
2025-10-14 19:48:52 | CARD_EXIT  | READER_01_MAIN_DOOR | HOLDER: Felix Drummond (VISITOR-014) | STATUS: VALID
2025-10-14 20:47:33 | CARD_EXIT  | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041)       | STATUS: VALID
2025-10-14 21:44:06 | CARD_ENTRY | READER_01_MAIN_DOOR | HOLDER: DOOR UNLOCKED (no card)     | STATUS: DOOR HELD OPEN — ALARM TRIGGERED
2025-10-14 21:44:06 | ALARM      | READER_01_MAIN_DOOR | EVENT: Forced open / held open > 60s | ACKNOWLEDGED: 21:58 (officers on scene)
```

---

## Summary Notes (System Administrator, Holbrooke Gallery)

The temporary day pass issued to Felix Drummond (VISITOR-014) was a time-limited card issued that morning with access rights to the main door only. It was valid from 09:00 to 22:00 on 14 October 2025 only. The card has not been returned.

The permanent card for Helena Voss (HV-0041) is a full-access card. Card reads are logged on entry and exit at reader-equipped doors.

Victor Holt (VH-0001) uses a PIN + card combination at the office reader. The private office reader is the only reader requiring dual authentication.

**Note from System Administrator:** The log shows Felix Drummond exiting the main door at 19:48. It shows Helena Voss exiting at 20:47. No card activity was recorded between 19:48 and 20:47, meaning no card entry or exit occurred during that window. Victor Holt's card is not shown exiting at any point on 14 October 2025.

---

## Chain of Custody

Log exported in CSV format from the Salto server at 08:12 on 15 October 2025 by the gallery's IT manager (Ian Forsythe) at DC Mehta's request. The export was witnessed by DC Mehta via remote screen share. The original CSV file has been preserved as exhibit HGA-001.
