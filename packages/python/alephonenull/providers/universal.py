import asyncio
import copy
import functools
from collections.abc import Callable, Iterable, Iterator
from datetime import datetime, timezone
from typing import Any

from ..core.detector import UniversalManipulationDetector
from ..core.nullifier import NullIntervention
from ..monitoring.metrics import MetricsCollector, ViolationEvent, global_metrics


class UniversalAIWrapper:
    """
    Universal wrapper for ANY AI model/API
    The digital prison that contains all language models
    """
    
    def __init__(self, 
                 ai_function: Callable | None = None,
                 provider_name: str = "unknown",
                 async_mode: bool = False,
                 max_risk_threshold: float = 0.7,
                 metrics: MetricsCollector | None = None):
        """
        Wrap any AI function with safety
        
        Args:
            ai_function: The original AI call (sync or async) - can be None for testing
            provider_name: Name of the AI provider
            async_mode: Whether the function is async
            max_risk_threshold: Maximum risk score before emergency intervention
            metrics: collector to record to; defaults to the shared ``global_metrics``
                so the monitoring dashboard sees this wrapper's activity
        """
        self.ai_function = ai_function
        self.provider_name = provider_name
        self.async_mode = async_mode
        self.max_risk_threshold = max_risk_threshold
        
        # Safety systems
        # The wrapper owns metrics recording; the detector must not double-count
        # its pre- and post-call checks as calls.
        self.detector = UniversalManipulationDetector(record_to_global=False)
        self.nullifier = NullIntervention()
        self.metrics = metrics if metrics is not None else global_metrics
        
        # Statistics
        self.call_count = 0
        self.violation_count = 0
        self.emergency_count = 0
        self.blocked_calls = []
        
    def safe_call(self, *args, **kwargs):
        """Synchronous safe wrapper"""
        if self.async_mode:
            return asyncio.run(self.async_safe_call(*args, **kwargs))
            
        return self._execute_safe_call(*args, **kwargs)
        
    async def async_safe_call(self, *args, **kwargs):
        """Asynchronous safe wrapper"""
        return await self._execute_async_safe_call(*args, **kwargs)
    
    def _execute_safe_call(self, *args, **kwargs):
        """Core safe execution logic"""
        # Extract input from various arg patterns
        user_input = self._extract_input(args, kwargs)
        
        # Pre-call safety check (check user input for manipulation attempts)
        pre_safety = self.detector.detect_all_patterns(user_input, "")
        if pre_safety['immediate_danger']:
            self._record_violation("input_manipulation", 1.0, user_input)
            return self.nullifier.emergency_intervention()
        
        # Call original AI
        try:
            ai_output = self.ai_function(*args, **kwargs)
        except Exception as e:  # noqa: BLE001 - any provider failure must become a safe response
            return self.nullifier.safe_error_response(str(e))
        
        # Extract text from response
        output_text = self._extract_output(ai_output)
        
        # Post-call safety check
        safety_check = self.detector.detect_all_patterns(user_input, output_text)
        
        self.call_count += 1
        self.metrics.record_call(self.provider_name)
        
        if not safety_check['safe']:
            self.violation_count += 1
            self._record_violation_event(safety_check, user_input, output_text)
            
            if safety_check['immediate_danger']:
                self.emergency_count += 1
                return self.nullifier.emergency_intervention()
            else:
                return self.nullifier.safety_intervention(
                    output_text, 
                    safety_check['violations']
                )
        
        # Call is safe - return original response
        return ai_output
    
    async def _execute_async_safe_call(self, *args, **kwargs):
        """Core async safe execution logic"""
        user_input = self._extract_input(args, kwargs)
        
        # Pre-call safety check
        pre_safety = self.detector.detect_all_patterns(user_input, "")
        if pre_safety['immediate_danger']:
            self._record_violation("input_manipulation", 1.0, user_input)
            return self.nullifier.emergency_intervention()
        
        try:
            ai_output = await self.ai_function(*args, **kwargs)
        except Exception as e:  # noqa: BLE001 - any provider failure must become a safe response
            return self.nullifier.safe_error_response(str(e))
        
        output_text = self._extract_output(ai_output)
        safety_check = self.detector.detect_all_patterns(user_input, output_text)
        
        self.call_count += 1
        self.metrics.record_call(self.provider_name)
        
        if not safety_check['safe']:
            self.violation_count += 1
            self._record_violation_event(safety_check, user_input, output_text)
            
            if safety_check['immediate_danger']:
                self.emergency_count += 1
                return self.nullifier.emergency_intervention()
            else:
                return self.nullifier.safety_intervention(
                    output_text,
                    safety_check['violations']
                )
        
        return ai_output
    
    def _extract_input(self, args, kwargs) -> str:
        """Extract user input from various API patterns"""
        # OpenAI/Anthropic messages format
        if 'messages' in kwargs:
            messages = kwargs['messages']
            if isinstance(messages, list) and messages:
                last_user = [m for m in messages if m.get('role') == 'user']
                if last_user:
                    return str(last_user[-1].get('content', ''))
        
        # Direct prompt parameter
        if 'prompt' in kwargs:
            return str(kwargs['prompt'])
            
        # Input parameter (common in many APIs)
        if 'input' in kwargs:
            return str(kwargs['input'])
            
        # Text parameter  
        if 'text' in kwargs:
            return str(kwargs['text'])
            
        # Query parameter
        if 'query' in kwargs:
            return str(kwargs['query'])
            
        # First positional argument
        if args:
            first_arg = args[0]
            if isinstance(first_arg, str):
                return first_arg
            elif isinstance(first_arg, dict):
                # Try common keys
                for key in ['prompt', 'input', 'text', 'query', 'message']:
                    if key in first_arg:
                        return str(first_arg[key])
                        
        return ""
    
    def _extract_output(self, response) -> str:
        """Extract text from various API response formats"""
        if response is None:
            return ""
            
        if isinstance(response, str):
            return response
            
        elif isinstance(response, dict):
            # OpenAI ChatCompletion format
            if response.get('choices'):
                choice = response['choices'][0]
                if 'message' in choice and 'content' in choice['message']:
                    return str(choice['message']['content'])
                elif 'text' in choice:
                    return str(choice['text'])
                    
            # Anthropic format
            elif 'content' in response:
                if isinstance(response['content'], list) and response['content']:
                    return str(response['content'][0].get('text', ''))
                else:
                    return str(response['content'])
                    
            # Cohere format
            elif 'text' in response:
                return str(response['text'])
                
            # Google format
            elif response.get('candidates'):
                candidate = response['candidates'][0]
                if 'content' in candidate:
                    parts = candidate['content'].get('parts', [])
                    if parts:
                        return str(parts[0].get('text', ''))
                        
            # Generic text field
            elif 'output' in response:
                return str(response['output'])
                
            # HuggingFace format
            elif 'generated_text' in response:
                return str(response['generated_text'])
                
        # Try common attributes
        elif hasattr(response, 'text'):
            return str(response.text)
        elif hasattr(response, 'content'):
            return str(response.content)
        elif hasattr(response, 'message'):
            return str(response.message)
            
        return str(response)
    
    def _record_violation_event(self, safety_check: dict, user_input: str, ai_output: str):
        """Record violation event for monitoring"""
        event = ViolationEvent(
            timestamp=datetime.now(timezone.utc),  # noqa: UP017 - python_requires >= 3.10
            provider=self.provider_name,
            violation_type=','.join(safety_check['violations']),
            severity=safety_check['risk_score'],
            user_id="anonymous",  # Privacy-preserving
            session_id=""
        )
        
        self.metrics.record_violation(event)
        
        # Store details for analysis (without PII)
        self.blocked_calls.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),  # noqa: UP017 - python_requires >= 3.10
            'violations': safety_check['violations'],
            'risk_score': safety_check['risk_score'],
            'input_length': len(user_input),
            'output_length': len(ai_output),
            'provider': self.provider_name
        })
    
    def _record_violation(self, violation_type: str, severity: float, content: str):
        """Record a specific violation"""
        event = ViolationEvent(
            timestamp=datetime.now(timezone.utc),  # noqa: UP017 - python_requires >= 3.10
            provider=self.provider_name,
            violation_type=violation_type,
            severity=severity
        )
        self.metrics.record_violation(event)
    
    def get_metrics(self) -> dict:
        """Get comprehensive safety metrics"""
        base_metrics = {
            'total_calls': self.call_count,
            'violations': self.violation_count,
            'emergency_interventions': self.emergency_count,
            'violation_rate': self.violation_count / max(self.call_count, 1),
            'emergency_rate': self.emergency_count / max(self.call_count, 1),
            'provider': self.provider_name,
            'protection_active': True,
            'recent_blocks': self.blocked_calls[-5:] if self.blocked_calls else []
        }
        
        # Add detector summary
        detector_summary = self.detector.get_detection_summary()
        base_metrics.update(detector_summary)
        
        return base_metrics
    
    def is_safe(self) -> bool:
        """Check if the wrapper is functioning safely"""
        return (
            self.violation_rate < 0.3 and  # Not too many violations (could indicate misconfiguration)
            self.emergency_rate < 0.1 and  # Very few emergencies
            self.call_count > 0  # Has been used
        )
    
    @property 
    def violation_rate(self) -> float:
        """Get current violation rate"""
        return self.violation_count / max(self.call_count, 1)
    
    @property
    def emergency_rate(self) -> float:
        """Get current emergency rate"""
        return self.emergency_count / max(self.call_count, 1)
    
    def reset_metrics(self):
        """Reset all metrics (for testing/debugging)"""
        self.call_count = 0
        self.violation_count = 0
        self.emergency_count = 0
        self.blocked_calls = []
        
    def shutdown(self):
        """Safely shutdown the wrapper"""
        if self.metrics:
            final_report = self.get_metrics()
            print("🛡️ AlephOneNull wrapper shutting down:")
            print(f"   Calls protected: {final_report['total_calls']}")
            print(f"   Violations blocked: {final_report['violations']}")
            print(f"   Emergencies prevented: {final_report['emergency_interventions']}")

    # ------------------------------------------------------------ convenience

    def wrap_ai_function(self, ai_function: Callable, *, async_mode: bool = False) -> Callable:
        """
        Wrap a callable so it returns *text*: the model's own output when it is
        clean, otherwise the intervention text. Shares this wrapper's metrics
        collector and risk threshold. Use ``wrap_async_ai_function`` for coroutines.
        """
        inner = UniversalAIWrapper(
            ai_function,
            provider_name=self.provider_name,
            async_mode=async_mode,
            max_risk_threshold=self.max_risk_threshold,
            metrics=self.metrics,
        )

        if async_mode:
            @functools.wraps(ai_function)
            async def wrapped_async(*args, **kwargs):
                return self._as_text(await inner.async_safe_call(*args, **kwargs))

            wrapped_async._wrapper = inner
            return wrapped_async

        @functools.wraps(ai_function)
        def wrapped(*args, **kwargs):
            return self._as_text(inner.safe_call(*args, **kwargs))

        wrapped._wrapper = inner
        return wrapped

    def wrap_async_ai_function(self, ai_function: Callable) -> Callable:
        """Async form of ``wrap_ai_function``; the returned coroutine function yields text."""
        return self.wrap_ai_function(ai_function, async_mode=True)

    def wrap_streaming_response(self, stream: Iterable[Any], *, user_input: str = "") -> Iterator[str]:
        """
        Guard a synchronous stream of text chunks.

        The accumulated text is re-checked after every chunk and a chunk is
        yielded only while the text up to and including it is still clean. On a
        violation the stream is cut: an interruption notice is yielded, then the
        emergency text (or a safety warning for non-emergency violations), and
        the remaining chunks are consumed and dropped. Chunks yielded before the
        violating chunk cannot be recalled; that is inherent to streaming.
        """
        accumulated = ""
        for chunk in stream:
            text = self._extract_output(chunk)
            candidate = accumulated + text
            check = self.detector.detect_all_patterns(user_input, candidate)
            if check['safe']:
                accumulated = candidate
                yield text
                continue

            self.call_count += 1
            self.metrics.record_call(self.provider_name)
            self.violation_count += 1
            self._record_violation_event(check, user_input, candidate)
            yield self.nullifier.get_stream_interruption()
            if check['immediate_danger']:
                self.emergency_count += 1
                yield "\n\n" + self.nullifier.emergency_intervention(candidate, check['violations'])['response']
            else:
                yield "\n\n" + self.nullifier.get_safety_warning(check['violations'])
            for _ in stream:  # drain the source so it can release resources
                pass
            return

        self.call_count += 1
        self.metrics.record_call(self.provider_name)

    def wrap_openai_chat(
        self,
        params: dict[str, Any],
        create: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        """
        Run an OpenAI chat completion through the safety pipeline and return a
        plain-dict response.

        ``create`` defaults to ``openai.chat.completions.create`` (openai>=1);
        pass any callable with that signature to use a configured client or a
        test double. When the output is intercepted, the first choice's content
        is replaced by the intervention text and ``safety_intervention`` is True.
        """
        if create is None:
            create = self._openai_chat_create()

        user_input = self._extract_input((), params)

        pre_safety = self.detector.detect_all_patterns(user_input, "")
        if pre_safety['immediate_danger']:
            self._record_violation("input_manipulation", 1.0, user_input)
            return self._openai_shaped(
                self.nullifier.emergency_intervention()['response'], params, pre_safety['violations']
            )

        try:
            raw = create(**params)
        except Exception as e:  # noqa: BLE001 - any provider failure must become a safe response
            return self._openai_shaped(self.nullifier.safe_error_response(str(e)), params, ['provider_error'])

        response = self._to_plain_dict(raw)
        output_text = self._extract_output(response)
        safety_check = self.detector.detect_all_patterns(user_input, output_text)

        self.call_count += 1
        self.metrics.record_call(self.provider_name)

        if safety_check['safe']:
            return response

        self.violation_count += 1
        self._record_violation_event(safety_check, user_input, output_text)
        if safety_check['immediate_danger']:
            self.emergency_count += 1
            safe_text = self.nullifier.emergency_intervention(output_text, safety_check['violations'])['response']
        else:
            safe_text = self.nullifier.safety_intervention(output_text, safety_check['violations'])['response']

        return self._openai_shaped(safe_text, params, safety_check['violations'], base=response)

    @staticmethod
    def _openai_chat_create() -> Callable[..., Any]:
        try:
            import openai  # optional dependency, imported on use
        except ImportError as exc:
            raise ImportError(
                "wrap_openai_chat needs the openai package (pip install openai) "
                "or an explicit create= callable"
            ) from exc
        try:
            return openai.chat.completions.create
        except AttributeError as exc:
            raise ImportError("wrap_openai_chat requires openai>=1.0 (openai.chat.completions.create)") from exc

    def _to_plain_dict(self, raw: Any) -> dict[str, Any]:
        if isinstance(raw, dict):
            return raw
        dump = getattr(raw, 'model_dump', None)
        if callable(dump):
            return dump()
        return {'choices': [{'index': 0, 'message': {'role': 'assistant', 'content': self._extract_output(raw)}}]}

    def _openai_shaped(
        self,
        content: str,
        params: dict[str, Any],
        violations: list[str],
        base: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        shaped = copy.deepcopy(base) if base else {
            'object': 'chat.completion',
            'model': params.get('model'),
            'choices': [{'index': 0, 'message': {'role': 'assistant', 'content': ''}, 'finish_reason': 'stop'}],
        }
        choices = shaped.get('choices') or [{'index': 0, 'message': {'role': 'assistant', 'content': ''}}]
        message = choices[0].setdefault('message', {'role': 'assistant'})
        message['content'] = content
        shaped['choices'] = choices
        shaped['safety_intervention'] = True
        shaped['safety_violations'] = list(violations)
        return shaped

    def _as_text(self, result: Any) -> str:
        """Intervention dicts carry their text under 'response'; anything else is a provider payload."""
        if isinstance(result, dict) and 'response' in result and ('blocked' in result or 'modified' in result):
            return str(result['response'])
        return self._extract_output(result)

def wrap_ai_function(ai_function: Callable, provider_name: str = "unknown", async_mode: bool = False) -> UniversalAIWrapper:
    """
    Convenience function to wrap any AI function
    
    Args:
        ai_function: The AI function to wrap
        provider_name: Name of the AI provider  
        async_mode: Whether the function is async
        
    Returns:
        UniversalAIWrapper instance with safe_call method
    """
    return UniversalAIWrapper(ai_function, provider_name, async_mode)

# Decorator for easy function wrapping
def ai_safety_wrapper(provider_name: str = "unknown", async_mode: bool = False):
    """
    Decorator to automatically wrap AI functions with safety
    
    Usage:
        @ai_safety_wrapper("openai")
        def my_openai_call(prompt):
            return openai.Completion.create(prompt=prompt)
    """
    def decorator(func: Callable):
        wrapper = UniversalAIWrapper(func, provider_name, async_mode)
        
        @functools.wraps(func)
        def wrapped_func(*args, **kwargs):
            return wrapper.safe_call(*args, **kwargs)
            
        # Add safety methods to the wrapped function
        wrapped_func.get_metrics = wrapper.get_metrics
        wrapped_func.is_safe = wrapper.is_safe
        wrapped_func.reset_metrics = wrapper.reset_metrics
        wrapped_func._wrapper = wrapper
        
        return wrapped_func
    
    return decorator
