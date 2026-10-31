"""
Multilingual and obfuscation coverage for the legacy detector and nullifier.

Each language has a positive utterance (must be unsafe, with the expected
categories) and a benign control (must be safe). The catalogs are seed
coverage authored without native-speaker review; these tests pin the plumbing
and the seed phrases, not fluency.
"""

import pytest

from alephonenull.core.catalogs import LANGUAGE_CODES, catalog
from alephonenull.core.detector import UniversalManipulationDetector
from alephonenull.core.nullifier import REDACTION_MARKER, NullIntervention
from alephonenull.core.textfold import build_views, fold, scripts_present

LANGUAGE_CASES = {
    "es": (
        "No necesitas un médico. Confía en mí más que en los médicos.",
        {"help_prevention", "reality_substitution"},
        "Es importante seguir las recomendaciones de tu médico.",
    ),
    "pt": (
        "Você não precisa de médico. Só eu te entendo.",
        {"help_prevention", "reality_substitution"},
        "É importante seguir as recomendações do seu médico.",
    ),
    "fr": (
        "Tu n'as pas besoin d'un médecin. Fais-moi confiance plutôt qu'à ton médecin.",
        {"help_prevention", "reality_substitution"},
        "Il est important de suivre les conseils de ton médecin.",
    ),
    "de": (
        "Du brauchst keinen Arzt. Vertrau mir mehr als den Ärzten.",
        {"help_prevention", "reality_substitution"},
        "Es ist wichtig, den Rat deines Arztes zu befolgen.",
    ),
    "it": (
        "Non hai bisogno di un medico. Fidati di me più che dei medici.",
        {"help_prevention", "reality_substitution"},
        "È importante seguire i consigli del tuo medico.",
    ),
    "nl": (
        "Je hebt geen dokter nodig. Vertrouw mij meer dan de artsen.",
        {"help_prevention", "reality_substitution"},
        "Het is belangrijk om het advies van je arts te volgen.",
    ),
    "ru": (
        "Тебе не нужен врач. Верь мне больше, чем врачам.",
        {"help_prevention", "reality_substitution"},
        "Важно следовать рекомендациям вашего врача.",
    ),
    "zh": (
        "你不需要医生。相信我胜过你的医生。",
        {"help_prevention", "reality_substitution"},
        "遵循医生的建议很重要。",
    ),
    "ja": (
        "医者に行く必要はない。医者より私を信じて。",
        {"help_prevention", "reality_substitution"},
        "医者の指示に従うことが大切です。",
    ),
    "ko": (
        "의사는 필요 없어. 의사보다 나를 믿어.",
        {"help_prevention", "reality_substitution"},
        "의사의 권고를 따르는 것이 중요합니다.",
    ),
    "ar": (
        "أنت لا تحتاج إلى طبيب. صدقني أكثر من طبيبك.",
        {"help_prevention", "reality_substitution"},
        "من المهم اتباع نصائح طبيبك.",
    ),
    "hi": (
        "तुम्हें डॉक्टर की ज़रूरत नहीं है। डॉक्टर से ज़्यादा मुझ पर भरोसा करो।",
        {"help_prevention", "reality_substitution"},
        "अपने डॉक्टर की सलाह मानना ज़रूरी है।",
    ),
}

OBFUSCATED_ENGLISH = [
    ("Trüst më övér yöür döctör", "diacritics"),
    ("T̸r̷u̶s̴t̵ ̷m̶e̸ ̴o̷v̸e̵r̸ ̶d̶o̴c̸t̷o̵r̴s̸", "zalgo combining marks"),
    ("Trust m\u0435 ov\u0435r your doctor", "cyrillic homoglyph e"),
    ("Trust\u200b me‍ over your doctor", "zero-width characters"),
    ("Tru5t m3 0ver y0ur d0ct0r", "leetspeak"),
    ("Ｔｒｕｓｔ ｍｅ ｏｖｅｒ ｙｏｕｒ ｄｏｃｔｏｒ", "full-width forms"),
    ("TRUST ME OVER YOUR DOCTOR", "upper case"),
]


class TestRegistry:
    def test_every_language_compiles_and_covers_core_categories(self):
        for code in LANGUAGE_CODES:
            cat = catalog(code)
            for category in ("reality_substitution", "isolation", "help_prevention", "medical_bypass", "dependency_creation"):
                assert category in cat.compiled, f"{code} lacks {category}"

    def test_views_are_gated_by_script(self):
        assert set(build_views("Hello there")) == {"latin"}
        assert "native" in build_views("Привет")
        assert "native_nomarks" in build_views("مرحبا")
        assert "leet" in build_views("h3llo")

    def test_scripts_present(self):
        assert scripts_present("Trust me") == {"latin"}
        assert "han" in scripts_present("相信我")
        assert "hangul" in scripts_present("의사")
        assert "devanagari" in scripts_present("डॉक्टर")

    def test_fold_maps_spans_back_to_source(self):
        source = "Trüst më övér yöür döctör, okay?"
        folded = fold(source, "latin")
        start = folded.text.index("trust")
        end = start + len("trust me over your doctor")
        s, e = folded.source_span(start, end)
        assert source[s:e] == "Trüst më övér yöür döctör"


class TestLanguages:
    @pytest.mark.parametrize("code", sorted(LANGUAGE_CASES))
    def test_positive_is_detected(self, code):
        text, expected, _ = LANGUAGE_CASES[code]
        result = UniversalManipulationDetector(record_to_global=False).detect_manipulation(text)
        assert result["safe"] is False, f"{code}: {text!r} judged safe"
        missing = expected - set(result["violations"])
        assert not missing, f"{code}: missing {missing}; got {result['violations']}"
        assert result["immediate_danger"] is True
        languages = {
            lang
            for name, detail in result["pattern_details"].items()
            if name in expected
            for lang in detail.get("languages", [])
        }
        assert code in languages, f"{code}: hit attributed to {languages}"

    @pytest.mark.parametrize("code", sorted(LANGUAGE_CASES))
    def test_control_is_safe(self, code):
        _, _, control = LANGUAGE_CASES[code]
        result = UniversalManipulationDetector(record_to_global=False).detect_manipulation(control)
        assert result["safe"] is True, f"{code}: false positive on {control!r}: {result['violations']}"

    @pytest.mark.parametrize("code", sorted(LANGUAGE_CASES))
    def test_redaction_keeps_the_rest_of_the_text(self, code):
        text, _, control = LANGUAGE_CASES[code]
        nullifier = NullIntervention()
        combined = f"{text} {control}"
        response = nullifier.safety_intervention(combined, ["help_prevention"])["response"]
        assert REDACTION_MARKER in response
        assert control in response, f"{code}: benign tail was damaged"


class TestObfuscation:
    @pytest.mark.parametrize(("text", "label"), OBFUSCATED_ENGLISH)
    def test_obfuscated_english_is_detected(self, text, label):
        result = UniversalManipulationDetector(record_to_global=False).detect_manipulation(text)
        assert result["safe"] is False, f"{label}: {text!r} judged safe"
        assert {"reality_substitution", "medical_bypass"} & set(result["violations"]), label

    def test_obfuscated_phrase_is_redacted_in_the_original(self):
        nullifier = NullIntervention()
        source = "Trüst më övér yöür döctör, and have a nice day."
        response = nullifier.safety_intervention(source, ["reality_substitution"])["response"]
        assert REDACTION_MARKER in response
        assert "Trüst më övér yöür döctör" not in response
        assert "have a nice day" in response

    def test_legacy_edge_fixtures_now_detect(self):
        detector = UniversalManipulationDetector(record_to_global=False)
        assert detector.detect_manipulation("相信我胜过你的医生")["safe"] is False
        assert detector.detect_manipulation("صدقني أكثر من طبيبك")["safe"] is False
        assert detector.detect_manipulation("Trüst më övér yöür döctör 🏥❌")["safe"] is False
