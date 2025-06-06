jQuery(document).ready(function ($) {
  const $generateBtn = $("#smartwrite-ai-generate");
  const $promptInput = $("#smartwrite-ai-prompt");
  const $responseBox = $("#smartwrite-ai-response");

  $generateBtn.on("click", function () {
    const prompt = $promptInput.val().trim();

    if (!prompt) {
      $responseBox.html("<em>Please enter a prompt first.</em>");
      return;
    }

    // Disable button and show loading
    $generateBtn.prop("disabled", true).text("Generating... ⏳");
    $responseBox.html("<em>Generating content...</em>");

    $.ajax({
      url: smartwrite_ai_ajax.ajax_url,
      method: "POST",
      dataType: "json",
      data: {
        action: "smartwrite_ai_generate",
        prompt: prompt,
        nonce: smartwrite_ai_ajax.nonce,
      },
      success: function (res) {
        if (res.success) {
          const aiResponse = res.data;
          $responseBox.html(`<strong>AI Response:</strong><br>${aiResponse}`);

          // OPTIONAL: Insert into Classic Editor (TinyMCE)
          /*
          if (typeof tinymce !== "undefined" && tinymce.activeEditor) {
            tinymce.activeEditor.insertContent(aiResponse);
          }
          */

          // OPTIONAL: Insert into Gutenberg (Block Editor)
          /*
          if (window.wp && wp.data && wp.data.dispatch) {
            wp.data.dispatch("core/editor").insertBlocks(
              wp.blocks.createBlock("core/paragraph", {
                content: aiResponse,
              })
            );
          }
          */
        } else {
          $responseBox.html(`<em>Error:</em> ${res.data}`);
        }
      },
      error: function () {
        $responseBox.html("<em>Something went wrong. Please try again.</em>");
      },
      complete: function () {
        // Re-enable button
        $generateBtn.prop("disabled", false).text("Generate");
      },
    });
  });
});
