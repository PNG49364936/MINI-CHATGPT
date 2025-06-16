import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="chat"
export default class extends Controller {
    static targets = ["prompt", "conversation"]

    clearConversation() {
        // Vider la zone de conversation
        this.conversationTarget.innerHTML = '';
        // Optionnel : vider aussi le textarea
        this.promptTarget.value = '';
      }

    printConversation() {
         const content = this.conversationTarget.innerHTML;
         const printWindow = window.open('', '', 'height=600,width=800');
         printWindow.document.write('<html><head><title>Conversation</title>');
         printWindow.document.write('<style>body { font-family: sans-serif; padding: 20px; }</style>');
         printWindow.document.write('</head><body >');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
    }  

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close()
        }
    }

    generateResponse(event) {
        event.preventDefault()

        this.#createLabel('Toi')
        this.#createMessage(this.promptTarget.value)
        this.#createLabel('Réponse ChatGPT')
        this.currentPre = this.#createMessage()

        this.#setupEventSource()

        this.promptTarget.value = ""
    }

    #createLabel(text) {
        const label = document.createElement('strong');
        label.innerHTML = `${text}:`;
        this.conversationTarget.appendChild(label);
    }

    #createMessage(text = '') {
        const preElement = document.createElement('pre');
        preElement.innerHTML = text;
        this.conversationTarget.appendChild(preElement);
        return preElement
    }

    #setupEventSource() {
        this.eventSource = new EventSource(`/chat_responses?prompt=${this.promptTarget.value}`)
        this.eventSource.addEventListener("message", this.#handleMessage.bind(this))
        this.eventSource.addEventListener("error", this.#handleError.bind(this))
    }

    #handleMessage(event) {
        const parsedData = JSON.parse(event.data);
        this.currentPre.innerHTML += parsedData.message;

        // Scroll to bottom of conversation
        this.conversationTarget.scrollTop = this.conversationTarget.scrollHeight;
    }

    #handleError(event) {
        if (event.eventPhase === EventSource.CLOSED) {
            this.eventSource.close()
        }
    }

   
}
