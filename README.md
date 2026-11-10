# Máquina Virtual 95

Uma área de trabalho no estilo Windows 95 que roda no navegador, feita com HTML, CSS e JavaScript puro. Não precisa instalar nada.

> Projeto de estudo e diversão.

## Como usar

**1. Clonar o repositório**

```bash
git clone https://github.com/aeevelynndosantos-star/maquina-virtual.git
cd maquina-virtual
```

- `git clone` baixa uma cópia do repositório. O endereço é o usuário (`aeevelynndosantos-star`) mais o nome do projeto (`maquina-virtual`).
- `cd maquina-virtual` entra na pasta criada, que tem o mesmo nome do repositório.

**2. Entrar na pasta do projeto**

```bash
cd maquina-virtual-95
```

O repositório guarda o projeto dentro da pasta `maquina-virtual-95`, então é preciso entrar nela também.

**3. Abrir no navegador**

Dê dois cliques no `index.html`, ou arraste ele para a janela do navegador.

Se algum recurso não funcionar abrindo o arquivo direto, rode um servidor local dentro da pasta e acesse `http://localhost:8000`:

```bash
python3 -m http.server 8000
```

## Estrutura

```
maquina-virtual/
└── maquina-virtual-95/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        ├── core.js
        ├── shell.js
        ├── settings.js
        └── mascots.js
```

## Licença

Defina aqui a licença do projeto.
