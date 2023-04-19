(function () {
  function waitForElement(selector, callback, maxRetries = 50) {
    const element = document.querySelector(selector);
    if (element) {
      // console.log('Element found:', selector);
      callback(element);
    } else if (maxRetries <= 0) {
      // console.log('Element not found, giving up:', selector);
    } else {
      // console.log('Element not found yet, retrying:', selector);
      setTimeout(() => waitForElement(selector, callback, maxRetries - 1), 100);
    }
  }

  function waitForMessages(selector, callback, maxRetries = 50) {
    const messages = document.querySelectorAll(selector);

    let allMessagesHaveContent = true;
    for (const message of messages) {
      const messagePreview = message.querySelector(".row-subtitle");
      if (!messagePreview || messagePreview.textContent.trim() === "") {
        allMessagesHaveContent = false;
        break;
      }
    }

    if (messages.length > 0 && allMessagesHaveContent) {
      // console.log('Messages found:', selector);
      callback(messages);
    } else if (maxRetries <= 0) {
      // console.log('Messages not found, giving up:', selector);
    } else {
      // console.log('Messages not found yet, retrying:', selector);
      setTimeout(
        () => waitForMessages(selector, callback, maxRetries - 1),
        100
      );
    }
  }

  let processedMessages = new Set();
  let clonedMessages = new Set();
  let clonedMessagesMap = new Map();

  function moveMessagesToSpam() {
    waitForElement(".sidebar-header__btn-container", (headerElement) => {
      const spamTab = document.createElement("button");
      //const headerElement = document.querySelector('.sidebar-header__btn-container');
      spamTab.className = "custom-spam-button";
      spamTab.style.position = "fixed";
      spamTab.style.right = "20px";
      spamTab.style.top = "80px";
      spamTab.style.zIndex = "9999";

      spamTab.style.width = "50px";
      spamTab.style.height = "50px";
      spamTab.style.backgroundImage =
        'url("' + chrome.runtime.getURL("images/icon.png") + '")';
      spamTab.style.backgroundSize = "cover";

      console.log("Spam icon URL:", spamTab.style.backgroundImage);

      // const spamIcon = document.createElement('img');
      // spamIcon.src = chrome.runtime.getURL('images/icon.png');
      // console.log("Spam icon URL:", spamIcon.src);
      // spamIcon.style.width = '50px';
      // spamIcon.style.height = '50px';
      // spamIcon.style.marginRight = '5px'; // Adjust the margin to position the icon

      // const spamText = document.createTextNode('Spam');

      // spamTab.appendChild(spamIcon);
      // spamTab.appendChild(spamText);

      spamTab.onclick = () => {
        const spamContainer = document.querySelector(".spam-container");
        spamContainer.style.display =
          spamContainer.style.display === "none" ? "block" : "none";
      };

      console.log("Adding Spam button");
      headerElement.parentElement.appendChild(spamTab);
    });

    function triggerRightClick(element) {
      const event = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2,
        buttons: 2,
      });

      element.dispatchEvent(event);
    }

    function processMessages() {
      waitForMessages(
        'ul.chatlist[data-autonomous="0"] a.chatlist-chat',
        (messageList) => {
          // console.log('Processing message list');
          // console.log('Total messages:', messageList.length);
          // console.log(processedMessages);
          // console.log( messageList[0]);
          if (messageList.length > 0) {
            let spamContainer;
            let spamContainerCurrent =
              document.querySelector(".spam-container");
            if (!spamContainerCurrent) {
              spamContainer = document.createElement("div");
              spamContainer.className = "spam-container";
              spamContainer.style.display = "none";
              spamContainer.style.position = "fixed";
              spamContainer.style.top = "150px";
              spamContainer.style.right = "20px";
              spamContainer.style.zIndex = 9999;
              // spamContainer.style.backgroundColor = '#fff';
              spamContainer.style.backgroundColor = "#fff";
              spamContainer.style.border = "1px solid #ccc";
              spamContainer.style.padding = "20px";
              spamContainer.style.height = "400px";
              spamContainer.style.overflow = "auto";
              spamContainer.style.width = "350px"; // Adjust the width of the spam box
              const body = document.querySelector("body");
              body.appendChild(spamContainer);
            } else {
              spamContainer = document.querySelector(".spam-container");
            }

            for (let i = 0; i < messageList.length; i++) {
              const message = messageList[i];

              // Log the message element to inspect it
              //console.log('Message element:', message);
              //console.log('PREVIEW:',messageList[i].querySelector('.row-subtitle').textContent)

              const messagePreviewElement =
                message.querySelector(".row-subtitle");
              // const className = messagePreviewElement.href;
              // console.log(className);
              const messagePreviewRegex = /(?:[^:]*: )(.*)/;
              // const messagePreviewMatch = messagePreviewElement.textContent.match(messagePreviewRegex);
              const messagePreviewMatch = messagePreviewElement.textContent;
              const messagePreview = messagePreviewMatch
                ? messagePreviewMatch.toLowerCase()
                : null;
              // const messagePreview = messageList[i].querySelector('.row-subtitle').textContent.match(/(?:[^:]*: )(.*)/)[1]

              //console.log('Message preview:', messagePreview);
              try {
                if (
                  messagePreview.includes("hi") ||
                  messagePreview.includes("hello")
                ) {
                  // console.log('Including message:', messagePreview);

                  message.style.display = "none";

                  const clonedMessage = message.cloneNode(true);

                  // Mark the message as processed
                  if (!processedMessages.has(message)) {
                    processedMessages.add(message);

                    // Add some custom styling to make the messages visible inside the spam container
                    clonedMessage.style.display = "flex";
                    clonedMessage.style.padding = "10px";
                    clonedMessage.style.flexDirection = "column";
                    clonedMessage.style.border = "1px solid #ccc";
                    clonedMessage.style.marginBottom = "10px";
                    clonedMessage.style.backgroundColor = "#f7f7f7";
                    clonedMessage.style.color = "#333";
                    clonedMessage.style.id = i + messagePreview[0];

                    // Adjust the location of the chat box profile picture
                    const avatar = clonedMessage.querySelector(".avatar-like");
                    if (avatar) {
                      avatar.style.marginBottom = "5px";
                    }

                    // Swap the position of message name and message preview
                    const rowTitleRow =
                      clonedMessage.querySelector(".row-title-row");
                    const rowSubtitleRow =
                      clonedMessage.querySelector(".row-subtitle-row");
                    if (rowTitleRow && rowSubtitleRow) {
                      rowTitleRow.parentElement.insertBefore(
                        rowSubtitleRow,
                        rowTitleRow
                      );
                    }
                    // Create a unique identifier for the message (e.g., a combination of the message URL and message content)
                    const messageIdentifier = message.href;

                    // Only add the cloned message to the clonedMessagesMap if it doesn't already exist
                    if (!clonedMessagesMap.has(messageIdentifier)) {
                      clonedMessagesMap.set(messageIdentifier, clonedMessage);
                    }
                  }
                } else {
                  // console.log('Excluding message:', messagePreview ? messagePreview : 'No preview');
                }
              } catch (error) {}
            }
            while (spamContainer.firstChild) {
              spamContainer.removeChild(spamContainer.firstChild);
            }
            const clonedArray = Array.from(clonedMessagesMap.entries());
            for (let [key, item] of clonedArray) {
              messageContainer = document.createElement("div");
              messageContainer.border = "2px solid white";
              messageContainer.style.display = "flex";
              messageContainer.style.flexDirection = "row";
              messageContainer.style.alignItems = "center";
              messageContainer.style.justifyContent = "center";
              deleteButton = document.createElement("button");
              deleteButton.innerHTML = "x";
              deleteButton.style.margin = "10px 0px 10px 10px";
              deleteButton.onclick = async function (element) {
                const spamContainer = document.querySelector(".spam-container");
                spamContainer.style.display =
                  spamContainer.style.display === "none" ? "block" : "none";
                const delay = (ms) =>
                  new Promise((resolve) => setTimeout(resolve, ms));

                // console.log(key)

                // Remove the telegram url and just get the Message ID
                const toRemove = "https://web.telegram.org/k/";
                const itemId = key.replace(toRemove, "");
                const el = document.querySelector(`[href="${itemId}"]`);

                // Right-click on the message
                if (el) triggerRightClick(el);
                else { alert('Something went wrong.') }

                // Click the delete button the menu
                await delay(500);                
                const menuDeleteButton = document.querySelector(".tgico-delete.danger")
                console.log('deleteButton', deleteButton)
                if (menuDeleteButton) menuDeleteButton.click()
                else { alert('Something went wrong.') }

                // Click the delete button confirmation
                await delay(500);
                const confirmDeleteButton = document.querySelector(".btn.danger.rp")
                if (confirmDeleteButton) {
                  confirmDeleteButton.click()
                  alert(`Message ${itemId} successfully deleted.`)
                }
                else { alert('Something went wrong.') }

                // window.open(key, "_self");
                // const menuButton = document.querySelector(".tgico-more");
                // if (menuButton) {
                //   menuButton.click();
                //   await delay(500);
                //   // Click on the Delete button
                //   const deleteButton = document.querySelector(".tgico-delete");
                //   if (deleteButton) {
                //     deleteButton.click();

                //     await delay(1000);

                //     // Click on the confirmation button to delete the message
                //     const confirmationButton = document.querySelector(
                //       ".popup-buttons button:first-child"
                //     );
                //     if (confirmationButton) {
                //       // confirmationButton.click();

                //       clonedMessagesMap.delete(key);
                //     }
                //   }
                // }
              };
              messageContainer.appendChild(item);
              messageContainer.appendChild(deleteButton);
              spamContainer.appendChild(messageContainer);
            }
          }
        }
      );
    }

    // Call processMessages every 5 seconds to check for new messages
    setInterval(processMessages, 5000);
  }

  moveMessagesToSpam();

  const style = document.createElement("style");
  style.innerHTML = `
  .custom-spam-button {
    background-color: white;
    color: blue;
    border: 1px solid blue;
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 14px;
    cursor: pointer;
    outline: none;
  }
  .custom-spam-button:hover {
    background-color: blue;
    color: white;
  }
`;
  document.head.appendChild(style);
})();
