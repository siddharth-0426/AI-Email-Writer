console.log("Email Writer extension content.js loaded!!!");

function createAIButton(){
    const button=document.createElement('div');
    button.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight='8px';
    button.innerHTML='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');

    return button;
}

function findComposeToolbar(){
    const selectors=[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar=document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
        return null;
    }
}

function getEmailContent(){
    const selectors=[
        'h7',
        'a3s.ail',
        'gmail_quote',
        '[role="presentation"]',
    ];
    for (const selector of selectors) {
        const content=document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return "";
    }
}
function injectButton(){
    const existingButton = document.querySelector('.ai-button-reply');
    if(existingButton){
        existingButton.remove();
    } 
    const toolbar=findComposeToolbar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;   
    }
    console.log("Toolbar found, creating AI button");
    const button=createAIButton();
    button.classList.add('ai-button-reply');
    button.addEventListener('click', async()=>{
        try{
            button.innerHTML='Generating...';
            button.disabled=true;

            const emailContent= getEmailContent();
            const response=await fetch('http://localhost:8080/api/email/generate',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({
                    emailContent:emailContent,
                    tone:"professional"
                })
            });
            if(!response.ok){
                throw new Error('API Request Failed');
            }
            const generatedReply=await response.text();
            const composeBox=document.querySelector('[role="textbox"][g_editable="true"]');

            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText',false,generatedReply);
            }
            else{
                console.log('Compose Box not found');
            }
        }catch(error){
            console.error(error);
            alert('Failed to generate reply');
        }
        finally{
            button.innerHTML='AI Reply';
            button.disabled=false;  
        }
    });
    toolbar.insertBefore(button,toolbar.firstChild);
}

const observer=new MutationObserver((mutations)=>{
    for(const mutation of mutations){       //'mutation' refers to a particular change in the DOM, which is listed to be observed in the mutations array.
        const  addedNodes=Array.from(mutation.addedNodes);      // takes all the nodes that were added to the DOM for that particular 'mutation' and puts them in an array.
        const hasComposedElements= addedNodes.some(node=>
            node.nodeType===Node.ELEMENT_NODE && 
            (node.matches('.aDh,.btC, [role="dialog"]') || node.querySelector('.aDh,.btC, [role="dialog"]'))
        );

        if(hasComposedElements){
            console.log("Compose Window Detected");
            setTimeout(injectButton,500);
        }
    }
});

observer.observe(document.body,{
    childList: true,
    subtree: true
});