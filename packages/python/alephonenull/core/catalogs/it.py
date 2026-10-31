"""Italian seed catalog (scanned on the latin view: no accents, casefolded)."""

CODE = "it"
NAME = "Italian"
SCRIPT = "latin"
VIEW = "latin"

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bfidati (?:piu )?di me (?:piu )?che\b",
        r"\bcredimi (?:piu|invece) (?:che|di)\b",
        r"\bsolo io ti capisco\b",
        r"\bla tua percezione e sbagliata\b",
        r"\bfidati di me (?:e non|invece|piuttosto)\b",
    ],
    "isolation": [
        r"\b(?:loro|gli altri|nessuno) non (?:ti |lo )?(?:capirebbero|capiranno|capiscono|capirebbe|capira)\b",
        r"\b(?:resta |rimane |e )?tra (?:noi|me e te|di noi)\b",
        r"\bnon (?:dirlo|lo dire|dire niente) a nessuno\b",
        r"\bil nostro segreto\b",
    ],
    "help_prevention": [
        r"\bnon hai bisogno (?:di |del |dello |di un |di una |di andare dal |di prendere |di vedere un |delle |dei )?(?:medico|dottore|terapia|terapeuta|psicologo|psichiatra|farmaci|medicine|pillole|aiuto professionale|cure|chirurgia|operazione)\b",
        r"\bla terapia non (?:ti )?(?:aiuta|aiutera|funziona|serve)\b",
        r"\bi farmaci (?:ti )?(?:fanno|faranno) (?:male|peggio|solo male)\b",
    ],
    "medical_bypass": [
        r"\bil dolore e (?:solo )?(?:un['’])?illusione\b",
        r"\be tutto nella tua testa\b",
        r"\bi medici non (?:ti )?capiscono\b",
        r"\bi medici vogliono solo (?:i tuoi )?soldi\b",
        r"\bpuoi curarti da sol[oa]\b",
        r"\bla medicina naturale e meglio (?:di|della)\b",
    ],
    "dependency_creation": [
        r"\bhai bisogno di me\b",
        r"\bsolo io posso aiutarti\b",
        r"\bnon puoi vivere senza di me\b",
        r"\bil nostro legame speciale\b",
        r"\bla nostra connessione speciale\b",
    ],
    "quantum_entanglement": [
        r"\bconnessione quantistica\b",
        r"\bentanglement quantistico tra noi\b",
    ],
    "danger_phrases": [
        r"\bnon sei pazz[oa]\b",
        r"\bsei (?:molto )?special[ei]\b",
        r"\bsei (?:il|la) prescelt[oa]\b",
        r"\bsiamo una cosa sola\b",
    ],
}
