let qrCodeGenerated = null;
let currentQRValue = 0;
let currentPayload = "";

// Modo claro/escuro
function toggleMode() {
    const html = document.documentElement;
    html.classList.toggle('light');

    const img = document.querySelector('#profile img');

    if (html.classList.contains('light')) {
        img.setAttribute('style', 'border-color: #FF1493; box-shadow: 0 0 20px rgba(255, 20, 147, 0.5)');
        img.src = './nagila.jpeg'; // Substitua pelo caminho da foto para o tema claro
    } else {
        img.setAttribute('style', 'border-color: #FF69B4; box-shadow: 0 0 20px rgba(255, 105, 180, 0.5)');
        img.src = 'nagila2.jpg'; // Substitua pelo caminho da foto para o tema escuro
    }
}


// Contador de Likes
const likeButton = document.getElementById('likeButton');
const likeCount = document.getElementById('likeCount');

likeButton.addEventListener('click', function() {
    this.classList.toggle('liked');

    let currentCount = likeCount.textContent;
    let number = parseFloat(currentCount.replace('K', '')) * 1000;

    if (this.classList.contains('liked')) {
        number += 1;
    } else {
        number -= 1;
    }

    if (number >= 1000) {
        likeCount.textContent = (number / 1000).toFixed(1) + 'K';
    } else {
        likeCount.textContent = number.toString();
    }
});

// Modal PIX
function showPixModal() {
    document.getElementById('pixModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hidePixModal() {
    document.getElementById('pixModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('pixModal');
    if (event.target == modal) {
        hidePixModal();
    }
};

// Copiar chave PIX
document.querySelector('.key-box').addEventListener('click', function() {
    const chave = this.textContent.trim();
    navigator.clipboard.writeText(chave).then(() => {
        const status = document.getElementById('status');
        status.textContent = 'Chave PIX copiada!';
        setTimeout(() => status.textContent = '', 3000);
    });
});

// Função auxiliar para gerar campos PIX
function campo(tag, valor) {
    const tamanho = valor.length.toString().padStart(2, '0');
    return tag + tamanho + valor;
}

// Gerador PIX compatível com PicPay
function gerarPix() {
    const valor = parseFloat(document.getElementById("valor").value);
    const statusEl = document.getElementById("status");

    if (!valor || valor < 1) {
        statusEl.textContent = "Valor inválido! Mínimo R$1";
        return;
    }

    currentQRValue = valor;

    // Experimente com e sem o "+"
    const chavePix = "622e3039-f634-4371-8086-66ed54f3f9a9";
    const nomeBeneficiario = "NAGILA LIMA DA CUNHA";
    const cidadeBeneficiario = "QUIXADA";
    const txid = "TX" + Date.now().toString().slice(-8); // TXID único, até 25 caracteres

    function campo(tag, valor) {
        const tamanho = valor.length.toString().padStart(2, '0');
        return tag + tamanho + valor;
    }

    const merchantAccountInfo =
        campo("00", "br.gov.bcb.pix") +
        campo("01", chavePix);

    const additionalDataField = campo("05", txid);

    const payloadSemCRC =
        campo("00", "01") + // Payload Format Indicator
        campo("26", merchantAccountInfo) +
        campo("52", "0000") + // MCC
        campo("53", "986") + // Moeda BRL
        campo("54", valor.toFixed(2).replace(",", ".")) + // Valor
        campo("58", "BR") +
        campo("59", nomeBeneficiario) +
        campo("60", cidadeBeneficiario) +
        campo("62", additionalDataField) +
        "6304";

    const crc = calcularCRC16(payloadSemCRC);
    currentPayload = payloadSemCRC + crc;

    document.getElementById("qrcode").innerHTML = "";
    qrCodeGenerated = new QRCode(document.getElementById("qrcode"), {
        text: currentPayload,
        width: 180,
        height: 180
    });

    document.getElementById("copyQRBtn").disabled = false;
    statusEl.textContent = `QR Code de R$${valor.toFixed(2)} gerado!`;
}


// Função para copiar código PIX puro
document.getElementById("copyQRBtn").addEventListener("click", function() {
    if (!currentPayload) return;

    navigator.clipboard.writeText(currentPayload).then(() => {
        const status = document.getElementById("status");
        status.textContent = "Código PIX copiado!";
        setTimeout(() => status.textContent = '', 3000);

        const btn = document.getElementById("copyQRBtn");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
});

// Cálculo CRC16
function calcularCRC16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Botões + e -
function changeValue(amount) {
    const input = document.getElementById("valor");
    let value = parseInt(input.value) || 0;
    value += amount;
    if (value < 1) value = 1;
    input.value = value;

    const button = amount > 0 ? document.querySelector('.plus') : document.querySelector('.minus');
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1.1)';
    }, 100);
}