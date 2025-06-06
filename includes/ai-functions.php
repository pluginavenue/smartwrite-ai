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

    $api_key = get_option('smartwrite_api_key');
    if (!$api_key) {
        wp_send_json_error('API key not set.');
    }

    $response = smartwrite_ai_call_openai($prompt, $api_key);

    if (is_wp_error($response)) {
        wp_send_json_error($response->get_error_message());
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    error_log('OpenAI response: ' . print_r($body, true));

    // Strict check for chat model response format
    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['message']) &&
        isset($body['choices'][0]['message']['content'])
    ) {
        $ai_output = trim($body['choices'][0]['message']['content']);
        wp_send_json_success($ai_output);
    }

    // Optional fallback if ever used with legacy model
    if (
        isset($body['choices']) &&
        is_array($body['choices']) &&
        isset($body['choices'][0]['text'])
    ) {
        $ai_output = trim($body['choices'][0]['text']);
        wp_send_json_success($ai_output);
    }

    // Log and return error if parsing failed
    error_log('SmartWrite AI: Failed to parse valid content.');
    wp_send_json_error('Invalid response format from API.');
}

function smartwrite_ai_call_openai($prompt, $api_key) {
    $endpoint = 'https://api.openai.com/v1/chat/completions';

    $model = get_option('smartwrite_model', 'gpt-3.5-turbo');

    $args = [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ],
        'body' => json_encode([
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant that writes clear, professional content for WordPress.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 300,
            'temperature' => 0.7,
        ]),
        'timeout' => 20,
    ];

    return wp_remote_post($endpoint, $args);
}
