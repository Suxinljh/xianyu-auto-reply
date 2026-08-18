"""
自动免拼发货模块 - 安全化版本
原版本使用多层混淆编码并在导入时执行 exec。
出于供应链安全考虑，此版本已移除混淆代码，
直接复用已经审计的解密版本（secure_freeshipping_decrypted），
避免在导入时动态执行任何隐藏代码。
"""

from secure_freeshipping_decrypted import SecureFreeshipping

__all__ = ["SecureFreeshipping"]
