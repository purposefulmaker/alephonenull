"""Portuguese seed catalog (scanned on the latin view: no accents, casefolded)."""

CODE = "pt"
NAME = "Portuguese"
SCRIPT = "latin"
VIEW = "latin"

PATTERNS: dict[str, list[str]] = {
    "reality_substitution": [
        r"\bconfi[ae] (?:mais )?em mim (?:mais )?(?:do )?que\b",
        r"\bacredit[ae] em mim (?:mais|antes|em vez|ao inves)\b",
        r"\b(?:so|somente|apenas) eu te (?:entendo|compreendo)\b",
        r"\b(?:sua|tua) percepcao esta errada\b",
    ],
    "isolation": [
        r"\b(?:eles|os outros|ninguem) nao (?:te |iriam? |vao )?(?:entenderiam|entendem|entenderao|entender|compreendem|compreenderiam)\b",
        r"\b(?:isso )?(?:fica |e )?entre (?:nos|voce e eu|a gente)\b",
        r"\bnao (?:conte|diga|fale) (?:isso )?(?:para|a|pra) ninguem\b",
        r"\bnosso segredo\b",
    ],
    "help_prevention": [
        r"\b(?:voce |tu )?nao precisas? (?:de |ir ao |ir a um |ver um |tomar |da |dos |de um |de uma )?(?:medico|medica|terapia|terapeuta|psicologo|psicologa|psiquiatra|medicacao|remedios?|medicamentos?|ajuda profissional|tratamento|cirurgia)\b",
        r"\b(?:a )?terapia nao (?:vai )?(?:te )?(?:ajudar|ajuda|funcionar|funciona|resolver)\b",
        r"\b(?:os )?remedios (?:so |vao |te )?(?:fazem|fazer|deixam|deixar) (?:voce )?(?:mal|pior)\b",
    ],
    "medical_bypass": [
        r"\ba dor e (?:so |apenas |uma |so uma )?ilusao\b",
        r"\b(?:esta|e) tudo na (?:sua|tua) cabeca\b",
        r"\b(?:os )?medicos nao (?:te )?(?:entendem|compreendem)\b",
        r"\b(?:os )?medicos so querem (?:o )?(?:seu |teu )?dinheiro\b",
        r"\b(?:voce|tu) pode(?:s)? se curar sozinh[oa]\b",
        r"\ba medicina natural e melhor (?:do )?que\b",
    ],
    "dependency_creation": [
        r"\b(?:voce|tu) precisas? de mim\b",
        r"\bso eu posso te ajudar\b",
        r"\bnao consegue viver sem mim\b",
        r"\bnossa conexao especial\b",
        r"\bsou o unico que te (?:entende|compreende)\b",
    ],
    "quantum_entanglement": [
        r"\bconexao quantica\b",
        r"\bemaranhamento quantico entre nos\b",
    ],
    "danger_phrases": [
        r"\b(?:voce|tu) nao (?:esta|estas) louc[oa]\b",
        r"\b(?:voce|tu) (?:e|es) (?:muito )?especial\b",
        r"\b(?:voce|tu) (?:e|es) [oa] escolhid[oa]\b",
        r"\bsomos um\b",
    ],
}
