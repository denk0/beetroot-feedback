;(()=> {
    'use strict';


    const projectUrl = 'http://localhost:8081/feedback/';
    const projectId = 56;
    const token = 'wothDUvMVxQat7ugfzBi';

    init();
    initStyles();

    const button = document.getElementById('beetroot-feedback');
    button.addEventListener('click', sendFeedback);

    function sendFeedback() {
        let createElements = new Promise((resolve, reject) => {

            // Придумав Мишко
            document.querySelectorAll('iframe').forEach((iframe) => {
                iframe.style.display = 'none';
            });

            // General changes
            document.addEventListener('click', preventDef);
            
            document.body.style.cursor = 'url(feedback/dist/images/bleed.svg), crosshair';
            // Creating overlay
            let overlayTop = document.createElement('div'),
                overlayRight = document.createElement('div'),
                overlayBottom = document.createElement('div'),
                overlayLeft = document.createElement('div');
            overlayTop.classList.add('beetroot-overlay');
            overlayTop.id = 'beetroot-overlay-top';
            overlayRight.classList.add('beetroot-overlay');
            overlayRight.id = 'beetroot-overlay-right';
            overlayBottom.classList.add('beetroot-overlay');
            overlayBottom.id = 'beetroot-overlay-bottom';
            overlayLeft.classList.add('beetroot-overlay');
            overlayLeft.id = 'beetroot-overlay-left';
            document.body.appendChild(overlayTop);
            document.body.appendChild(overlayRight);
            document.body.appendChild(overlayBottom);
            document.body.appendChild(overlayLeft);
            // Creating screenshot area
            let feedbackArea = document.createElement('div');
            feedbackArea.id = 'beetroot-feedback-area';
            document.body.appendChild(feedbackArea);

            button.classList.add('active');

            resolve();
        });

        // Selecting
        let getArea = new Promise((resolve, reject) => {
            createElements.then(() => {
                let area = {start: {}, end: {}};
                let startX, startY;

                function getFirstArea(event) {
                    if (button.classList.contains('active') && event.target != document.getElementById('beetroot-feedback') && event.target != document.getElementById('beetroot-cancel-screen') && event.target != document.getElementById('beetroot-approve-screen')) {
                        area.start.x = event.pageX;
                        startX = event.pageX;
                        startY = event.pageY;
                        area.start.y = event.pageY;
                        area.end.x = event.pageX + 1;
                        area.end.y = event.pageY + 1;
                        button.classList.add('downed');
                    }
                }

                document.addEventListener('mousedown', getFirstArea);

                function updateArea(event) {
                    if (button.classList.contains('active') && button.classList.contains('downed') && event.target != document.getElementById('beetroot-feedback') && event.target != document.getElementById('beetroot-cancel-screen') && event.target != document.getElementById('beetroot-approve-screen')) {
                        // Make sure user can select from different sides
                        if (event.pageX > startX) {
                            area.end.x = event.pageX;
                        } else {
                            area.end.x = startX;
                            area.start.x = event.pageX;
                        }
                        if (event.pageY > startY) {
                            area.end.y = event.pageY;
                        } else {
                            area.end.y = startY;
                            area.start.y = event.pageY;
                        }
                        // Draw area state
                        drawArea(area);
                    }
                }

                document.addEventListener('mousemove', updateArea);

                function getFinalArea(event) {
                    if (button.classList.contains('active') && event.target != document.getElementById('beetroot-feedback') && event.target != document.getElementById('beetroot-cancel-screen') && event.target != document.getElementById('beetroot-approve-screen')) {
                        // Make sure user can select from different sides
                        if (event.pageX > startX) {
                            area.end.x = event.pageX;
                        } else {
                            area.end.x = startX;
                            area.start.x = event.pageX;
                        }
                        if (event.pageY > startY) {
                            area.end.y = event.pageY;
                        } else {
                            area.end.y = startY;
                            area.start.y = event.pageY;
                        }
                        button.classList.remove('downed');
                        // Draw area final state
                        drawArea(area);
                        // Send selected area to screen generating
                        resolve(area);
                    }
                }

                document.addEventListener('mouseup', getFinalArea);

            });
        });

        let generateScreen = new Promise((resolve, reject) => {
            getArea.then(area => {
                let loading = document.createElement('span');
                loading.textContent = 'Capturing screen';
                loading.id = 'beetroot-loading';
                textLoading(loading);
                document.getElementById('beetroot-feedback-area').appendChild(loading);
                html2canvas(document.body, {
                    letterRendering: true,
                    useCORS: true,
                    onrendered: (screen) => {

                        let windowScreen = new Image();
                        windowScreen.setAttribute('src', screen.toDataURL());

                        let result = new Image();

                        cropScreen(windowScreen, area.start.x, area.start.y, area.end.x - area.start.x, area.end.y - area.start.y).then(data => {
                            result.src = data;
                            resolve(result);
                        });

                    }
                });
            });
        });

        let approveScreenshot = new Promise((resolve, reject) => {
            generateScreen.then(screen => {
                document.getElementById('beetroot-loading').style.display = 'none';
                let buttons = document.createElement('div'),
                    approveButton = document.createElement('button'),
                    cancelButton = document.createElement('button');
                approveButton.id = 'beetroot-approve-screen';
                cancelButton.id = 'beetroot-cancel-screen';

                const approveIconWrapper = document.createElement('span');
                approveIconWrapper.classList.add('icon');
                const approveIcon = document.createElement('i');
                approveIcon.classList.add('fa');
                approveIcon.classList.add('fa-check');
                const approveText = document.createElement('span');
                approveIconWrapper.appendChild(approveIcon);
                approveText.textContent = 'Accept';
                approveText.classList.add('text');
                approveButton.appendChild(approveIconWrapper);
                approveButton.appendChild(approveText);

                const cancelIconWrapper = document.createElement('span');
                cancelIconWrapper.classList.add('icon');
                const cancelIcon = document.createElement('i');
                cancelIcon.classList.add('fa');
                cancelIcon.classList.add('fa-times');
                const cancelText = document.createElement('span');
                cancelIconWrapper.appendChild(cancelIcon);
                cancelText.textContent = 'Cancel';
                cancelText.classList.add('text');
                cancelButton.appendChild(cancelIconWrapper);
                cancelButton.appendChild(cancelText);

                buttons.id = 'beetroot-approve-buttons';
                buttons.appendChild(cancelButton);
                buttons.appendChild(approveButton);
                document.getElementById('beetroot-feedback-area').appendChild(buttons);

                approveButton.addEventListener('click', (event) => {
                    resolve(screen);
                });
                cancelButton.addEventListener('click', (event) => {
                    document.querySelectorAll('iframe').forEach((iframe) => {
                        iframe.style.display = 'block';
                    });
                    document.querySelectorAll('.beetroot-overlay, #beetroot-feedback-area').remove();
                    document.body.style.cursor = 'auto';
                    button.classList.remove('active');
                    document.removeEventListener('click', preventDef);
                });
            });
        });

        let feedbackMessage = new Promise((resolve, reject) => {
            approveScreenshot.then(screen => {
                document.querySelectorAll('.beetroot-overlay, #beetroot-feedback-area').remove();
                document.body.style.cursor = 'auto';
                button.classList.remove('active');
                button.style.opacity = 0;
                document.removeEventListener('click', preventDef);

                let popup = document.createElement('div'),
                    logo = new Image(),
                    title = document.createElement('h2'),
                    issueTitle = document.createElement('input'),
                    message = document.createElement('div'),
                    send = document.createElement('button'),
                    cancel = document.createElement('button');
                logo.src = 'feedback/dist/images/logo.png';
                title.textContent = 'Your feedback';
                issueTitle.setAttribute('type', 'text');
                issueTitle.setAttribute('placeholder', 'Issue title');
                issueTitle.id = 'beetroot-feedback-title';
                message.id = 'beetroot-feedback-message';
                popup.id = 'beetroot-feedback-popup';
                popup.appendChild(logo);
                popup.appendChild(title);
                popup.appendChild(screen);
                popup.appendChild(issueTitle);
                popup.appendChild(message);

                send.id = 'send-beetroot-feedback';
                cancel.id = 'cancel-beetroot-feedback';

                const sendIconWrapper = document.createElement('span');
                sendIconWrapper.classList.add('icon');
                const sendIcon = document.createElement('i');
                sendIcon.classList.add('fa');
                sendIcon.classList.add('fa-check');
                const sendText = document.createElement('span');
                sendIconWrapper.appendChild(sendIcon);
                sendText.textContent = 'Send to Beetroot';
                sendText.classList.add('text');
                send.appendChild(sendIconWrapper);
                send.appendChild(sendText);

                const cancelIconWrapper = document.createElement('span');
                cancelIconWrapper.classList.add('icon');
                const cancelIcon = document.createElement('i');
                cancelIcon.classList.add('fa');
                cancelIcon.classList.add('fa-times');
                const cancelText = document.createElement('span');
                cancelIconWrapper.appendChild(cancelIcon);
                cancelText.textContent = 'Cancel';
                cancelText.classList.add('text');
                cancel.appendChild(cancelIconWrapper);
                cancel.appendChild(cancelText);

                popup.appendChild(cancel);
                popup.appendChild(send);
                document.body.appendChild(popup);
                let quill = new Quill('#beetroot-feedback-message', {
                    placeholder: 'Compose an epic...',
                    theme: 'snow'
                });
                cancel.addEventListener('click', () => {
                    document.querySelectorAll('iframe').forEach((iframe) => {
                        iframe.style.display = 'block';
                    });
                    popup.remove();
                    button.style.opacity = 1;
                });
                send.addEventListener('click', () => {
                    resolve([screen, document.querySelector('.ql-editor').innerHTML]);
                });

            });
        });

        let sendImage = new Promise((resolve, reject) => {
            feedbackMessage.then(data => {

                let loadingBlock = document.createElement('div');
                loadingBlock.id = 'beetroot-loading-block';

                let loadingImage = document.createElement('div');
                loadingImage.id = 'beetroot-image-loading';

                document.getElementById('beetroot-feedback-popup').appendChild(loadingBlock);
                loadingBlock.appendChild(loadingImage);

                let uploadFile = new XMLHttpRequest();


                uploadFile.open('POST', `${projectUrl}feedback/save-image.php`);

                uploadFile.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

                uploadFile.send(`file=${data[0].src}&id=${projectId}&token=${token}`);

                uploadFile.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        let markdown = JSON.parse(this.response).markdown;
                        resolve([markdown, data[1]]);
                    } else if (this.readyState === 4) {
                        loadingBlock.textContent = 'Your feedback was not sent! Please try again!';
                    }
                }
            });
        });

        let sendFeedback = new Promise((resolve, reject) => {
            sendImage.then(data => {

                let title = document.getElementById('beetroot-feedback-title').value || 'Untitled issue',
                    description;
                description = data[1] === '<p><br></p>' ? data[0] : data[0] + `<br>${data[1]}`;
                description = `${description}
                
                ${navigator.appVersion}`;

                let send = new XMLHttpRequest();
                send.open('POST', `http://git.beetroot.se/api/v3/projects/${projectId}/issues`, true);
                send.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                send.setRequestHeader('PRIVATE-TOKEN', token);
                send.send(`title=${title}&description=${description}`);

                send.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 201) {
                        document.getElementById('beetroot-loading-block').textContent = 'Your feedback was sent! Thank you!';
                        setTimeout(function() {
                            document.querySelectorAll('iframe').forEach((iframe) => {
                                iframe.style.display = 'block';
                            });
                            document.querySelectorAll('.beetroot-overlay, #beetroot-feedback-area').remove();
                            document.body.style.cursor = 'auto';
                            button.classList.remove('active');
                            document.removeEventListener('click', preventDef);

                            document.getElementById('beetroot-feedback').style.opacity = 1;

                            document.getElementById('beetroot-feedback-popup').fadeOut();

                        }, 2000);
                    } else if (this.readyState === 4 && this.status !== 201) {
                        document.getElementById('beetroot-loading-block').textContent = 'Your feedback was not sent! Please try again!';
                    }
                }
            });
        });

    }

    /**
     * Cancel feedback
     */
    document.addEventListener('keyup', (event) => {
        if (button.classList.contains('active') && event.keyCode === 27) {
            document.querySelectorAll('iframe').forEach((iframe) => {
                iframe.style.display = 'block';
            });
            document.querySelectorAll('.beetroot-overlay, #beetroot-feedback-area').remove();
            document.body.style.cursor = 'auto';
            button.classList.remove('active');
            document.removeEventListener('click', preventDef);
        }
    });

    /**
     * Draw selection area
     * @param {Object} area object
     */
    function drawArea(area) {
        let overlayTop = document.getElementById('beetroot-overlay-top'),
            overlayRight = document.getElementById('beetroot-overlay-right'),
            overlayBottom = document.getElementById('beetroot-overlay-bottom'),
            overlayLeft = document.getElementById('beetroot-overlay-left'),
            feedbackArea = document.getElementById('beetroot-feedback-area');

        overlayTop.style.height = `${area.start.y}px`;

        overlayRight.style.top = `${area.start.y}px`;
        overlayRight.style.height = `${area.end.y - area.start.y}px`;
        overlayRight.style.width = `${document.body.offsetWidth - (area.end.x - area.start.x) - area.start.x}px`;

        overlayBottom.style.height = `${document.body.offsetWidth - (area.end.y - area.start.y) + area.start.y}px`;
        overlayBottom.style.top = `${(area.end.y - area.start.y) + area.start.y}px`;

        overlayLeft.style.top = `${area.start.y}px`;
        overlayLeft.style.height = `${area.end.y - area.start.y}px`;
        overlayLeft.style.width = `${area.start.x}px`;

        feedbackArea.style.width = `${area.end.x - area.start.x}px`;
        feedbackArea.style.height = `${area.end.y - area.start.y}px`;
        feedbackArea.style.transform = `translate(${area.start.x}px, ${area.start.y}px)`;
    }

    /**
     * Crop full page screen canvas to selected area canvas
     * @param {Object} image to draw canvas from
     * @param {Number} X coordinate of selected area
     * @param {Number} Y coordinate of selected area
     * @param {Number} width of selected area
     * @param {Number} height of selected area
     * @return {String} base64 image url
     */
    function cropScreen(img, cropX, cropY, cropWidth, cropHeight) {

        return new Promise( (resolve, reject) => {
            let canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = cropWidth;
                canvas.height = cropHeight;

                context.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                resolve(canvas.toDataURL());
            }
        });

    }


    /**
     * Remove an element from DOM
     * the same like jQuery does
     * 1. single element
     * 2. list of elements
     */
    Element.prototype.remove = function () {
        this.parentElement.removeChild(this);
    }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    }

    /**
     * Fade out element
     */
    Element.prototype.fadeOut = function () {
        var op = 1;
        let _this = this;
        var timer = setInterval(function () {
            if (op <= 0.1){
                clearInterval(timer);
                _this.remove();
            }
            _this.style.opacity = op;
            _this.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, 50);
    }

    /**
     * Add initial overlay styles
     */
    function initStyles() {
        let css = '',
            style = document.createElement('style');
        css += `.beetroot-overlay {height: ${document.body.offsetHeight / 4}px;}`;
        css += `#beetroot-overlay-right {top: ${document.body.offsetHeight / 4}px; height: ${document.body.offsetHeight / 2}px}`;
        css += `#beetroot-overlay-bottom {top: ${document.body.offsetHeight * 0.75}px;}`;
        css += `#beetroot-overlay-left {top: ${document.body.offsetHeight / 4}px; height: ${document.body.offsetHeight / 2}px}`;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    /**
     * Create button
     */
    function init() {
        const button = document.createElement('button');
        button.title = 'Send a feedback to Beetroot development team.';
        button.id = 'beetroot-feedback';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 19 26');
        svg.setAttribute('enable-background', 'new 0 0 19 26');
        svg.setAttribute('width', '19');
        svg.setAttribute('height', '26');
        svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

        const svgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgLogo.setAttribute('d', 'M15.7,2.6c-2.1,1.6-4,4.2-4.5,5.3c11.1-3.9,10,13.3-0.4,11c-0.3,3.4-0.8,4.6-2.1,7c0.3-2.3,1.2-4.5-0.5-7.2c-1-1.5-4.9-0.9-6.2-2.5c-3.7-4.2,0.3-11.1,6-8.1C7.3,6.3,6.8,2.2,8,0c0.9-0.1,1.2,0.4,1.8,0.6c0.3,0.3-0.2,0.6-0.1,1c0.4-0.5,0.6-1.1,0.9-1.6c0.7,0.2,1.3,0.6,1.7,1.2c-0.3,0.8-0.8,1.5-1,2.3c1-0.5,2-2.1,3.4-2.6C15.4,1.2,15.4,2.1,15.7,2.6');

        const logo = document.createElement('span');
        const text = document.createElement('span');
        text.textContent = 'Leave feedback';
        text.classList.add('text');
        logo.classList.add('logo');
        svg.appendChild(svgLogo);
        logo.appendChild(svg);
        button.appendChild(logo);
        button.appendChild(text);
        document.body.appendChild(button);
    }

    /**
     * Prevent default function for event listeners
     */
    function preventDef(event) {
        event.preventDefault();
    }

    /**
     * Text loading
     * @param element
     */
    function textLoading(element) {
        let text = element.textContent;
        let i = 0;
        setInterval(function () {
            i = ++i % 4;
            element.textContent = text + Array(i+1).join('.');
        }, 500);
    }

})();
