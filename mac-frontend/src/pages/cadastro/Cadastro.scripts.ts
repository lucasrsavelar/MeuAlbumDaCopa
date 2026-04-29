export const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) {
        return 'Nome de usuário é obrigatório.';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Nome de usuário pode conter apenas letras, números, underscore (_) e hífen (-).';
    }
    if (value.length < 2 || value.length > 32) {
        return 'Nome de usuário deve ter entre 2 e 32 caracteres.';
    }
    return undefined;
};