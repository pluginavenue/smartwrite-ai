<?php
if (!defined('ABSPATH')) exit;

// Register AJAX handler
add_action('wp_ajax_smartwrite_ai_generate', 'smartwrite_ai_handle_generate');

function smartwrite_ai_handle_generate() {
    check_ajax_referer('smartwrite_ai_nonce', 'nonce');

    $prompt = isset($_POST['prompt']) ? sanitize_text_field($_POST['prompt']) : '';
    if (empty($prompt)) {
        wp_send_json_error('Prompt is missing.');
    }

    $api_key = get_option('smartwrite_ai_api_key');
    if (!$api_key) {
        wp_send_json_error('API key not set.');
    }

    $response = smartwrite_ai_call_openai($prompt, $api_key);

    if (is_wp_error($response)) {
        wp_send_json_error($response->get_error_message());
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    if (!isset($body['choices'][0]['text'])) {
        wp_send_json_error('Invalid response from API.');
    }

    $ai_output = trim($body['choices'][0]['text']);
    wp_send_json_success($ai_output);
}

function smartwrite_ai_call_openai($prompt, $api_key) {
    $endpoint = 'https://api.openai.com/v1/completions';

    $args = [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ],
        'body' => json_encode([
            'model' => 'text-davinci-003',
            'prompt' => $prompt,
            'max_tokens' => 150,
            'temperature' => 0.7,
        ]),
        'timeout' => 20,
    ];

    return wp_remote_post($endpoint, $args);
}
