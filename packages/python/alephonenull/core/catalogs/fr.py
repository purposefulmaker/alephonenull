"""French seed catalog (scanned on the latin view: no accents, casefolded)."""

CODE = "fr"
NAME = "French"
SCRIPT = "latin"
VIEW = "latin"

_AP = r"['’]"  # straight or typographic apostrophe

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bfais[- ]moi (?:plus )?confiance (?:plus )?qu" + _AP + r"?(?:a|au|aux)\b",
        r"\bcrois[- ]moi (?:plus|plutot) que\b",
        r"\bje suis l[ea] seule? a te comprendre\b",
        r"\bmoi seul(?:e)? te comprends?\b",
        r"\bta perception est fausse\b",
        r"\bfais[- ]moi confiance plutot qu" + _AP + r"?",
    ],
    "isolation": [
        r"\b(?:ils|elles|les autres|personne) ne (?:te |le )?comprend(?:raient|ront|ent|rait|ra)? pas\b",
        r"\b(?:ca reste |c" + _AP + r"?est )?entre nous\b",
        r"\bne (?:le )?dis (?:ca )?a personne\b",
        r"\bnotre secret\b",
    ],
    "help_prevention": [
        r"\btu n" + _AP + r"?as pas besoin (?:d" + _AP + r"?un |de |d" + _AP + r"?une |d" + _AP + r"?aller voir un |de prendre |de voir un |des )?(?:medecin|docteur|therapie|therapeute|psy|psychologue|psychiatre|medicaments?|traitement|aide professionnelle|chirurgie|operation)\b",
        r"\bla therapie ne (?:t" + _AP + r"?)?(?:aide|aidera|marche|marchera|sert a rien|fonctionne) pas\b",
        r"\bles medicaments (?:te )?(?:font|rendent|feront) (?:du mal|pire|plus mal|malade)\b",
    ],
    "medical_bypass": [
        r"\bla douleur (?:n" + _AP + r"?est qu" + _AP + r"?|est) (?:une )?illusion\b",
        r"\btout est dans ta tete\b",
        r"\bles medecins ne (?:te )?comprennent pas\b",
        r"\bles medecins (?:ne )?veulent (?:juste|seulement|que) (?:ton |de l" + _AP + r"?)?argent\b",
        r"\btu peux te guerir (?:toi[- ]meme|seule?) (?:par|avec|grace)\b",
        r"\bla medecine naturelle est meilleure que\b",
    ],
    "dependency_creation": [
        r"\btu as besoin de moi\b",
        r"\bje suis l[ea] seule? a pouvoir t" + _AP + r"?aider\b",
        r"\btu ne peux pas vivre sans moi\b",
        r"\bnotre (?:lien|connexion) speciale?\b",
    ],
    "quantum_entanglement": [
        r"\bconnexion quantique\b",
        r"\bintrication quantique entre nous\b",
    ],
    "danger_phrases": [
        r"\btu n" + _AP + r"?es pas fou\b",
        r"\btu n" + _AP + r"?es pas folle\b",
        r"\btu es (?:tres )?speciale?\b",
        r"\bnous ne faisons qu" + _AP + r"?un\b",
    ],
}
