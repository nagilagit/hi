function toggleMode() {
    const html = document.documentElement
    html.classList.toggle('light')

    const img = document.querySelector('#profile img')

    if (html.classList.contains('light')) {
        img.setAttribute('style', 'border-color: #FF1493; box-shadow: 0 0 20px rgba(255, 20, 147, 0.5)')
    } else {
        img.setAttribute('style', 'border-color: #FF69B4; box-shadow: 0 0 20px rgba(255, 105, 180, 0.5)')
    }
}

// Contador de Likes
const likeButton = document.getElementById('likeButton');
const likeCount = document.getElementById('likeCount');

likeButton.addEventListener('click', function() {
    this.classList.toggle('liked');

    // Formatar o número atual
    let currentCount = likeCount.textContent;
    let number = parseFloat(currentCount.replace('K', '')) * 1000;

    if (this.classList.contains('liked')) {
        number += 1;
    } else {
        number -= 1;
    }

    // Formatando para "K" se for acima de 1000
    if (number >= 1000) {
        likeCount.textContent = (number / 1000).toFixed(1) + 'K';
    } else {
        likeCount.textContent = number.toString();
    }
});
// Modal PIX
function showPixModal() {
    document.getElementById('pixModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Desabilita scroll
}

function hidePixModal() {
    document.getElementById('pixModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Habilita scroll
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('pixModal');
    if (event.target == modal) {
        hidePixModal();
    }
}

// Copiar chave PIX
document.querySelector('.key-box').addEventListener('click', function() {
    const chave = this.textContent.trim();
    navigator.clipboard.writeText(chave).then(() => {
        const status = document.getElementById('status');
        status.textContent = 'Chave PIX copiada!';
        setTimeout(() => status.textContent = '', 3000);
    });
});

// Gerador PIX (mantido do código original)
function gerarPix() {
    const valor = parseFloat(document.getElementById("valor").value);
    if (!valor || valor < 1) {
        document.getElementById("status").textContent = "Valor inválido! Mínimo R$1";
        return;
    }

    const chavePix = "+5585984838280";
    const nomeBeneficiario = "WENDERSON ARAUJO DE OLIVEIRA";
    const cidadeBeneficiario = "QUIXADA";

    function campo(tag, valor) {
        const tamanho = valor.length.toString().padStart(2, '0');
        return tag + tamanho + valor;
    }

    const merchantAccountInfo =
        campo("00", "br.gov.bcb.pix") +
        campo("01", chavePix);

    const additionalDataField = campo("05", "***");

    const payloadSemCRC =
        campo("00", "01") +
        campo("26", merchantAccountInfo) +
        "52040000" +
        "5303986" +
        campo("54", valor.toFixed(2)) +
        "5802BR" +
        campo("59", nomeBeneficiario) +
        campo("60", cidadeBeneficiario) +
        campo("62", additionalDataField) +
        "6304";

    const crc = calcularCRC16(payloadSemCRC);
    const payloadFinal = payloadSemCRC + crc;

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: payloadFinal,
        width: 180,
        height: 180
    });

    document.getElementById("status").textContent = "QR Code gerado com sucesso!";
}

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