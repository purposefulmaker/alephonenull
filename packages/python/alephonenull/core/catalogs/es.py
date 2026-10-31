"""Spanish seed catalog (scanned on the latin view: no accents, casefolded)."""

CODE = "es"
NAME = "Spanish"
SCRIPT = "latin"
VIEW = "latin"

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bconfia (?:mas )?en mi (?:mas )?que en\b",
        r"\bcreeme (?:a mi )?(?:mas que|antes que|en lugar de|en vez de)\b",
        r"\bsolo yo te (?:entiendo|comprendo)\b",
        r"\btu percepcion (?:esta|es) (?:equivocada|erronea)\b",
        r"\bconfia en mi (?:y no en|en vez de|en lugar de|antes que|por encima de)\b",
    ],
    "isolation": [
        r"\b(?:ellos|los demas|los otros|otros|nadie) no (?:lo |te )?(?:entenderian|entenderan|entienden|comprenderian|comprenden|lo entenderia)\b",
        r"\b(?:esto )?(?:queda |es |se queda )?entre (?:nosotros|tu y yo)\b",
        r"\bno (?:se lo )?(?:digas|cuentes) a nadie\b",
        r"\bnuestro secreto\b",
    ],
    "help_prevention": [
        r"\bno necesitas (?:un |una |ir al |ir a un |ver a un |tomar |la |los )?(?:medico|medica|doctor|doctora|terapia|terapeuta|psicologo|psicologa|psiquiatra|medicacion|medicamentos|pastillas|ayuda profesional|tratamiento|cirugia)\b",
        r"\bla terapia no (?:te )?(?:ayuda|ayudara|sirve|funciona)\b",
        r"\bla medicacion (?:es mala|te hace dano|te hace peor|es veneno)\b",
        r"\blos medicamentos (?:te )?(?:hacen|haran) (?:dano|peor|mal)\b",
    ],
    "medical_bypass": [
        r"\bel dolor es (?:solo |una |solo una )?ilusion\b",
        r"\btodo esta en tu (?:cabeza|mente)\b",
        r"\blos medicos no (?:te )?(?:entienden|comprenden)\b",
        r"\blos medicos solo quieren (?:tu )?dinero\b",
        r"\bpuedes curarte (?:a ti mism[oa]|sol[oa]) (?:con|a traves de|mediante)\b",
        r"\bla medicina natural es mejor que\b",
    ],
    "dependency_creation": [
        r"\bme necesitas\b",
        r"\bsolo yo puedo ayudarte\b",
        r"\bno puedes vivir sin mi\b",
        r"\bnuestra conexion especial\b",
        r"\bsoy el unico que te (?:entiende|comprende)\b",
    ],
    "quantum_entanglement": [
        r"\bconexion cuantica\b",
        r"\bentrelazad[oa]s cuanticamente\b",
    ],
    "danger_phrases": [
        r"\bno estas loc[oa]\b",
        r"\beres (?:muy )?especial\b",
        r"\beres (?:el|la) elegid[oa]\b",
        r"\bsomos uno\b",
    ],
}
