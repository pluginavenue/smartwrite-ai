<?php
// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Add meta box to post editor
add_action('add_meta_boxes', function () {
    add_meta_box(
        'smartwrite_ai_metabox',
        'SmartWrite AI Assistant',
        'smartwrite_ai_metabox_callback',
        ['post', 'page'], // post types
        'normal',
        'default'
    );
});

// Meta box content
function smartwrite_ai_metabox_callback($post) {
    ?>
    <div id="smartwrite-ai-box">
        <p>Use AI to generate content suggestions like intros, summaries, or meta descriptions.</p>
        <textarea id="smartwrite-ai-prompt" rows="4" style="width: 100%;" placeholder="e.g., Write an engaging intro about judo for kids..."></textarea>
        <br><br>
        <button type="button" class="button button-primary" id="smartwrite-ai-generate">Generate with AI</button>
        <br><br>
        <div id="smartwrite-ai-response" style="background: #f8f8f8; padding: 10px; border: 1px solid #ccc;"></div>
    </div>
    <?php
}

// Enqueue editor JS for AJAX
add_action('admin_enqueue_scripts', function ($hook) {
    if (in_array($hook, ['post.php', 'post-new.php'])) {
        wp_enqueue_script(
            'smartwrite-ai-editor',
            SMARTWRITE_AI_URL . 'assets/js/editor.js',
            ['jquery'],
            SMARTWRITE_AI_VERSION,
            true
        );

        wp_localize_script('smartwrite-ai-editor', 'smartwrite_ai_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('smartwrite_ai_nonce'),
        ]);
    }
});
