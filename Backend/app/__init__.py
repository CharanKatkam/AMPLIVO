import types
import fastapi.routing

original_get_typed_return_annotation = fastapi.routing.get_typed_return_annotation

def patched_get_typed_return_annotation(call):
    ret = original_get_typed_return_annotation(call)
    if ret is types.NoneType:
        return None
    return ret

fastapi.routing.get_typed_return_annotation = patched_get_typed_return_annotation
