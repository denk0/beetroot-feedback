<?php

function base64_to_image( $base64_string, $output_file) {
    $file = fopen( $output_file, 'wb' );

    $data = explode( ',', $base64_string );

    fwrite( $file, base64_decode(str_replace(" ", "+", $data[1])) );
    fclose( $file );

    return $output_file;
}

function generateRandomName($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

if ( isset($_POST) ) :

    $image = base64_to_image( $_POST['file'], 'tmp/' . generateRandomName(10) . '.jpg' );

    $upload_to_gitlab = curl_init();

    curl_setopt($upload_to_gitlab, CURLOPT_URL, "http://git.beetroot.se/api/v3/projects/" . $_POST['id'] . "/uploads");
    curl_setopt($upload_to_gitlab, CURLOPT_HEADER, false);
    curl_setopt($upload_to_gitlab, CURLOPT_POST, 1);
    curl_setopt($upload_to_gitlab, CURLOPT_HTTPHEADER, array(
        "Content-Type:multipart/form-data",
        "PRIVATE-TOKEN:" . $_POST['token']
    ));
    curl_setopt($upload_to_gitlab, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($upload_to_gitlab, CURLOPT_INFILESIZE, true);

    $fields = [
        'file' => new CURLFile( realpath($image), 'image/jpg',  str_replace('tmp/', '', $image) )
    ];

    curl_setopt($upload_to_gitlab, CURLOPT_POSTFIELDS, $fields);


    $result = curl_exec($upload_to_gitlab);

    if (curl_errno($upload_to_gitlab)) {
        echo 'Error: ' . curl_error($upload_to_gitlab);
    } else {
        echo $result;
    }

    curl_close($upload_to_gitlab);

endif;

