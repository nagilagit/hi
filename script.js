function toggleMode() {
    const html = document.documentElement
    html.classList.toggle('light')

    const img = document.querySelector('#profile img')

    if (html.classList.contains('light')) {
        img.setAttribute('src', './nagila.jpeg')
        img.setAttribute('alt', 'Foto de nagila lima tiktoker')
    } else {
        img.setAttribute('src', './nagila2.jpg')
        img.setAttribute('alt', 'Foto de nagila lima fisioterapeuta')
    }
}