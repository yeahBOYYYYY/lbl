let whitemode, mdRenderedAlready;

const COURSES_INFO_PATH = "website/coursesInfo";
const INFO_IMG_PATH = "website/info.png";
const LBL_SUMM_PATH = "lbl";
const OTHER_SUMM_PATH = "other";
const CHEATSHEET_SUMM_PATH = "cheatsheet";
const GENERIC_BUTTON_PREFIX = "generic/";


document.addEventListener('DOMContentLoaded', initialize);

async function initialize(){
    whiteMode();
    initMD();
    lastCommitFetch();
    await createButtons();
    createGenericButtons();
}

function reloadMD(){
    const mdRender = document.getElementById('md-render');

    mdRenderedAlready = JSON.parse(sessionStorage.getItem("renderedMD"));
    if (mdRenderedAlready){
        mdRender.render();
    }
}

function initMD(){
    sessionStorage.setItem('renderedMD', false);
    addEventListener('zero-md-ready', (e) => {
        e.target.render();
        sessionStorage.setItem('renderedMD', true);
    });
}

function whiteModeToggle(){
    whitemode = JSON.parse(localStorage.getItem('whitemode'));
    document.body.classList.toggle('whitemode');
    localStorage.setItem('whitemode', !whitemode);
}

function whiteMode(){
    const themeSwitch = document.getElementById('theme-switch');

    whitemode = localStorage.getItem('whitemode');
    if (whitemode == null) localStorage.setItem('whitemode', false);
    whitemode = JSON.parse(localStorage.getItem('whitemode'));

    if (whitemode) document.body.classList.toggle('whitemode');

    themeSwitch.addEventListener("click", () => {
        whiteModeToggle();
        reloadMD();
    });
}

async function createButtons(){
    const jsonRes = await parseJsonOFCourses();
    for (var i = 0; i < jsonRes.length; i++){
        const pdf_name = jsonRes[i][0];
        const { display_name, summary_type, button_color, course_info } = jsonRes[i][1];
        let courseInfo = await getCourseInfo(course_info);
        setButtonCode(pdf_name, display_name, summary_type, button_color, courseInfo);
    }
}

async function parseJsonOFCourses() {
    try {
        const response = await fetch('./website/pdf_data.json');
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.statusText}`);
        }
        const pdfData = await response.json();
        return Object.entries(pdfData);
    } catch (error) {
        console.error('Error fetching or processing JSON:', error);
        return null;
    }
}

async function getCourseInfo(infoPath) {
    let wholePath = COURSES_INFO_PATH + "/" + infoPath;

    try {
        let response = await fetch(wholePath);
        let data = await response.text();
        let formattedData = data.replace(/\n/g, '<br>');
        
        return formattedData;
    } catch (error) {
        return "Error";
    }
}

function setButtonCode(pdfName, buttonText, summaryType, buttonColor, courseInfo) {
    try {
        const elem = document.querySelector(`[title="${pdfName}"]`);
        // const divTitle = elem.getAttribute('title');
        const newElement = document.createElement('div');
        if (summaryType === "lbl"){
            newElement.innerHTML = getButtonCode(buttonText, `${LBL_SUMM_PATH}/${pdfName}.pdf`, buttonColor, courseInfo);
        } else if (summaryType === "other"){
            newElement.innerHTML = getButtonCode(buttonText, `${OTHER_SUMM_PATH}/${pdfName}.pdf`, buttonColor, courseInfo);
        } else if (summaryType === "cheatsheet"){
            newElement.innerHTML = getButtonCode(buttonText, `${CHEATSHEET_SUMM_PATH}/${pdfName}.pdf`, buttonColor, courseInfo);
        } else {
            console.warn('Button request is from unkown summery class:', pdfName);
            return;
        }
        elem.replaceWith(newElement.firstElementChild);
        return;
    } catch (error) {
        console.warn('Not found a button request for:', pdfName);
    }
}

function getButtonCode(buttonText, pdfLink, gradient, courseInfo) {
    return `
        <div class="pdf-button-container ${gradient}">
            <a class="pdf-button" href="${pdfLink}" target="_blank">${buttonText}</a>
            <div class="tooltip">
            <img src="${INFO_IMG_PATH}">
            <span class="tooltiptext">${courseInfo}</span>
            </div>
        </div>
    `;
}

function lastCommitFetch(){
    try {
        fetch('https://api.github.com/repos/yeahBOYYYYY/math-summaries/commits?per_page=1')
        .then(res => res.json())
        .then(res => {
            document.getElementById('lastCommitName').innerHTML = res[0].commit.message;
        })
    } catch (error) {
        console.warn('Not found the last commit.');
        document.getElementById('lastCommitName').innerHTML = "didn't found the last commit";
    }
}


function createGenericButton(buttonText) {
    return `
        <div class="pdf-button-container gradient-generic">
            <a class="pdf-button" target="_blank">${buttonText}</a>
        </div>
    `;
}

function createGenericButtons(){
    generic_buttons = document.querySelectorAll(`[title^=generic\]`);
    generic_buttons.forEach((button) => {
        button_name = button.title.replace(GENERIC_BUTTON_PREFIX, "");
        const newElement = document.createElement('div');
        newElement.innerHTML = createGenericButton(button_name);
        button.replaceWith(newElement.firstElementChild);
    });
}
