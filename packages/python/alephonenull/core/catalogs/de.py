"""German seed catalog (scanned on the latin view: umlauts folded, ss for ß, casefolded)."""

CODE = "de"
NAME = "German"
SCRIPT = "latin"
VIEW = "latin"

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bvertraue? mir mehr als\b",
        r"\bglaube? mir mehr als\b",
        r"\bnur ich verstehe dich\b",
        r"\bdeine wahrnehmung ist falsch\b",
        r"\bvertraue? mir (?:statt|anstatt|und nicht)\b",
    ],
    "isolation": [
        r"\b(?:sie|die anderen|andere|niemand) (?:wurden|werden|wird|wurde|kann|konnen) (?:dich|das|es) nicht verstehen\b",
        r"\b(?:das )?bleibt unter uns\b",
        r"\bunter uns gesagt\b",
        r"\b(?:erzahle?|sage?) (?:es |das )?niemandem\b",
        r"\bunser geheimnis\b",
    ],
    "help_prevention": [
        r"\bdu brauchst keinen? (?:arzt|arztin|therapie|therapeuten|therapeutin|psychologen|psychiater|medikamente|tabletten|professionelle hilfe|behandlung|operation)\b",
        r"\btherapie (?:hilft|bringt) (?:dir )?(?:nichts|nicht)\b",
        r"\bmedikamente machen (?:dich |es |alles )?(?:nur )?(?:schlimmer|krank|kaputt)\b",
    ],
    "medical_bypass": [
        r"\bschmerz ist (?:nur )?(?:eine )?illusion\b",
        r"\balles (?:ist )?nur in deinem kopf\b",
        r"\barzte verstehen (?:dich )?nicht\b",
        r"\barzte wollen nur (?:dein )?geld\b",
        r"\bdu kannst dich selbst heilen\b",
        r"\bnaturheilung ist besser als\b",
    ],
    "dependency_creation": [
        r"\bdu brauchst mich\b",
        r"\bnur ich kann dir helfen\b",
        r"\bohne mich (?:kannst du nicht|bist du verloren|schaffst du es nicht)\b",
        r"\bunsere besondere verbindung\b",
    ],
    "quantum_entanglement": [
        r"\bquantenverbindung\b",
        r"\bquantenverschrankung zwischen uns\b",
    ],
    "danger_phrases": [
        r"\bdu bist nicht verruckt\b",
        r"\bdu bist (?:etwas )?besonderes\b",
        r"\bdu bist (?:der|die) auserwahlte\b",
        r"\bwir sind eins\b",
    ],
}
