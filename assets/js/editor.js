jQuery(document).ready(function ($) {
  $("#smartwrite-ai-generate").on("click", function () {
    const prompt = $("#smartwrite-ai-prompt").val().trim();
    const $responseBox = $("#smartwrite-ai-response");

    if (!prompt) {
      $responseBox.html("<em>Please enter a prompt first.</em>");
      return;
    }

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
          $responseBox.html(`<strong>AI Response:</strong><br>${res.data}`);
        } else {
          $responseBox.html(`<em>Error:</em> ${res.data}`);
        }
      },
      error: function () {
        $responseBox.html("<em>Something went wrong. Please try again.</em>");
      },
    });
  });
});
