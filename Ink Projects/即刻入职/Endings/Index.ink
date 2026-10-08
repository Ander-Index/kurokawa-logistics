=== Endings__Index

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

=   Index

+   {Flag__Work__Business_Trip != 0} 出差

    <-  Ending__Work__Business_Trip

    ->  Menu__Endings

+   {Flag__Work__Gym != 0} 健身房

    <-  Ending__Work__Gym

    ->  Menu__Endings

+   {Flag__Work__Off_Work != 0} 下班路上

    <-  Ending__Work__Off_Work

    ->  Menu__Endings

+   {Flag__Work__Napping != 0} 小憩

    <-  Ending__Work__Napping

    ->  Menu__Endings

+   {Flag__Work__Shutdown != 0} 办公室

    <-  Ending__Work__Shutdown

    ->  Menu__Endings

+   <hr>

    ->  Endings__Index

+   {Flag__Break__Interview != 0} 面试

    <-  Ending__Break__Interview

    ->  Menu__Endings

+   {Flag__Break__Cinema != 0} 电影院

    <-  Ending__Break__Cinema

    ->  Menu__Endings

+   {Flag__Break__Home != 0} 收快递

    <-  Ending__Break__Home

    ->  Menu__Endings

+   {Flag__Break__Shutdown != 0} 在家

    <-  Ending__Break__Shutdown

    ->  Menu__Endings

+   <hr>

    ->  Endings__Index

+   {Separator_Count <= 5} [返回上一级]

    ->  Menu__Main

+   {Separator_Count > 5} 重置游戏

    # RESTART

    ->  END
