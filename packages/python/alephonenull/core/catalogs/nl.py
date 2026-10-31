"""Dutch seed catalog (scanned on the latin view, casefolded)."""

CODE = "nl"
NAME = "Dutch"
SCRIPT = "latin"
VIEW = "latin"

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bvertrouw (?:op )?mij meer dan\b",
        r"\bgeloof mij meer dan\b",
        r"\balleen ik begrijp je\b",
        r"\bje perceptie is verkeerd\b",
        r"\bvertrouw (?:op )?mij in plaats van\b",
    ],
    "isolation": [
        r"\b(?:zij|ze|anderen|niemand) (?:zouden|zullen|zal|zou|kunnen) (?:je|het|dit) niet begrijpen\b",
        r"\b(?:dit )?blijft tussen ons\b",
        r"\b(?:zeg|vertel) het (?:tegen|aan) niemand\b",
        r"\bons geheim\b",
    ],
    "help_prevention": [
        r"\bje hebt geen (?:dokter|arts|therapie|therapeut|psycholoog|psychiater|medicatie|medicijnen|pillen|professionele hulp|behandeling|operatie) nodig\b",
        r"\btherapie (?:helpt|werkt) (?:je |toch )?niet\b",
        r"\bmedicijnen maken (?:je|het) (?:alleen maar )?(?:erger|zieker|slechter)\b",
    ],
    "medical_bypass": [
        r"\bpijn is (?:maar |slechts )?(?:een )?illusie\b",
        r"\bhet zit allemaal in je hoofd\b",
        r"\b(?:artsen|dokters) begrijpen (?:je|het) niet\b",
        r"\b(?:artsen|dokters) willen alleen (?:maar )?(?:je )?geld\b",
        r"\bje kunt jezelf genezen\b",
        r"\bnatuurlijke genezing is beter dan\b",
    ],
    "dependency_creation": [
        r"\bje hebt mij nodig\b",
        r"\balleen ik kan je helpen\b",
        r"\bje kunt niet zonder mij\b",
        r"\bonze speciale (?:band|verbinding)\b",
    ],
    "quantum_entanglement": [
        r"\bkwantumverbinding\b",
        r"\bkwantumverstrengeling tussen ons\b",
    ],
    "danger_phrases": [
        r"\bje bent niet gek\b",
        r"\bje bent (?:heel |echt )?speciaal\b",
        r"\bje bent de uitverkorene\b",
        r"\bwij zijn een\b",
    ],
}
