=== Dream__Index

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

=   Check

~   temp Roll = RANDOM(1,100)

/*

【DEV】Roll = {Roll}

【DEV】INDEX = {INDEX}

【DEV】SAN：{Check__SAN(INDEX)}

*/

{

-   Check__SAN(INDEX) == "FINE":

    //  【DEV】精神状态良好不用随机做梦。

    ->  Base__Startup

-   Check__SAN(INDEX) == "OK" && Roll <= 50:

    【DEV】Roll 到了梦境。50%

    ->  Shuffle

-   Check__SAN(INDEX) == "OK" && Roll > 50:

    【DEV】没 Roll 到梦境。50%

    ->  Base__Startup

-   Check__SAN(INDEX) == "BAD" && Roll <= 75:

    【DEV】Roll 到了梦境。75%

    ->  Shuffle

-   Check__SAN(INDEX) == "BAD" && Roll > 75:

    【DEV】没 Roll 到梦境。25%

    ->  Base__Startup

-   Check__SAN(INDEX) == "AWFUL" && Roll <= 100:

    【DEV】精神濒临崩溃，必做梦。100%

    ->  Shuffle

-   else:

    其他情况。出 BUG 了

    ->  BUG

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

=   Shuffle

{   shuffle:

    -   <-  Dream1

    -   <-  Dream2

    -   <-  Dream3

    -   <-  Dream4

    -   <-  Dream5

    -   <-  Dream6

}

{

-   Check__Aboard_Status() == "No.8":

    ->  Base__Wakeup

-   else:

    ->  Base__Startup

}
