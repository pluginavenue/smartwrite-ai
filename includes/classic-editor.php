<?php
if (!defined('ABSPATH')) exit;

add_action('add_meta_boxes', function () {
    // SmartWrite AI box just under the post title
    add_meta_box(
        'smartwrite_ai_box',
        'SmartWrite AI Generator',
        'smartwrite_render_meta_box',
        'post',
        'normal', // 'side' or 'advanced'
        'high'
    );
});

function smartwrite_render_meta_box($post) {
    $nonce = wp_create_nonce('smartwrite_ai_nonce');
    ?>
    <div id="smartwrite-ai-box">
        <label for="smartwrite-prompt"><strong>Prompt:</strong></label><br>
        <textarea id="smartwrite-prompt" style="width: 100%; height: 60px;"></textarea><br>

        <!-- Generate Button First -->
        <button type="button" id="smartwrite-generate" class="button button-primary" data-nonce="<?php echo esc_attr($nonce); ?>">
            Generate Content
        </button>

        <!-- Output appears here -->
        <div id="smartwrite-output" style="margin-top: 10px;"></div>

        <!-- Suggest Meta Button moved down here -->
        <button type="button" id="smartwrite-meta" class="button button-secondary" style="margin-top: 10px;">
            Suggest Meta Description
        </button>
    </div>
    <?php
}
