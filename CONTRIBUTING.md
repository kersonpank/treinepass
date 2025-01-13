# Guia de Contribuição

## Branches

- `main`: Branch de produção
- `develop`: Branch de desenvolvimento
- `feature/*`: Branches para novas funcionalidades
- `hotfix/*`: Branches para correções urgentes

## Workflow

1. **Desenvolvimento de novas features**:
   ```bash
   git checkout develop
   git checkout -b feature/nome-da-feature
   # Desenvolva a feature
   git commit -m "feat: descrição da feature"
   # Crie um Pull Request para develop
   ```

2. **Correções urgentes**:
   ```bash
   git checkout main
   git checkout -b hotfix/descricao-do-fix
   # Faça a correção
   git commit -m "fix: descrição da correção"
   # Crie um Pull Request para main
   ```

3. **Commits**:
   Seguimos o padrão Conventional Commits:
   - `feat`: Nova funcionalidade
   - `fix`: Correção de bug
   - `docs`: Documentação
   - `style`: Formatação
   - `refactor`: Refatoração
   - `test`: Testes
   - `chore`: Manutenção

4. **Pull Requests**:
   - Descreva as mudanças
   - Adicione testes quando necessário
   - Aguarde review
   - Mantenha o PR atualizado com a branch destino
