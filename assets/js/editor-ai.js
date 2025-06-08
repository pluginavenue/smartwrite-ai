jQuery(document).ready(function ($) {
  const $generateBtn = $("#smartwrite-generate");
  const $promptInput = $("#smartwrite-prompt");
  const $responseBox = $("#smartwrite-output");

  $generateBtn.on("click", function () {
    const prompt = $promptInput.val().trim();

    if (!prompt) {
      $responseBox.html("<em>Please enter a prompt first.</em>");
      return;
    }

    $generateBtn.prop("disabled", true).text("Generating... ⏳");
    $responseBox.html("<em>Generating content...</em>");

    $.ajax({
      url: SmartWriteAI.ajax_url,
      method: "POST",
      dataType: "json",
      data: {
        action: "smartwrite_ai_generate",
        prompt: prompt,
        nonce: SmartWriteAI.nonce,
      },
      success: function (res) {
        if (res.success) {
          const aiResponse = res.data;
          $responseBox.html(`<strong>AI Response:</strong><br>${aiResponse}`);
        } else {
          $responseBox.html(`<em>Error:</em> ${res.data}`);
        }
      },
      error: function () {
        $responseBox.html("<em>Something went wrong. Please try again.</em>");
      },
      complete: function () {
        $generateBtn.prop("disabled", false).text("Generate");
      },
    });
  });
});
